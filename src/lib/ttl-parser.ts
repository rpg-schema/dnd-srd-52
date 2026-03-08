// Simple TTL (Turtle) parser for visualization purposes
export interface OntologyEntity {
  uri: string;
  localName: string;
  types: string[];
  label?: string;
  comment?: string;
  description?: string;
  properties: Record<string, string[]>;
}

export interface OntologyData {
  prefixes: Record<string, string>;
  classes: OntologyEntity[];
  properties: OntologyEntity[];
  instances: OntologyEntity[];
  ontologyMeta?: OntologyEntity;
}

function resolvePrefix(term: string, prefixes: Record<string, string>): string {
  if (term.startsWith('<') && term.endsWith('>')) {
    return term.slice(1, -1);
  }
  const colonIdx = term.indexOf(':');
  if (colonIdx >= 0) {
    const prefix = term.slice(0, colonIdx);
    const local = term.slice(colonIdx + 1);
    if (prefixes[prefix]) {
      return prefixes[prefix] + local;
    }
  }
  return term;
}

function getLocalName(uri: string): string {
  const hashIdx = uri.lastIndexOf('#');
  const slashIdx = uri.lastIndexOf('/');
  const idx = Math.max(hashIdx, slashIdx);
  return idx >= 0 ? uri.slice(idx + 1) : uri;
}

function stripLangTag(value: string): string {
  return value.replace(/@\w+(-\w+)*$/, '');
}

function unquote(value: string): string {
  let v = stripLangTag(value.trim());
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
}

export function parseTTL(ttlContent: string): OntologyData {
  const prefixes: Record<string, string> = {};
  const entities: Record<string, OntologyEntity> = {};

  // Parse prefixes
  const prefixRegex = /@prefix\s+(\w*):\s+<([^>]+)>\s*\./g;
  let match;
  while ((match = prefixRegex.exec(ttlContent)) !== null) {
    prefixes[match[1]] = match[2];
  }

  // Parse @base
  const baseMatch = ttlContent.match(/@base\s+<([^>]+)>/);
  if (baseMatch) {
    prefixes[''] = baseMatch[1];
  }

  // Remove comments and normalize
  const lines = ttlContent.split('\n');
  const cleanLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('@prefix') || trimmed.startsWith('@base')) continue;
    cleanLines.push(line);
  }
  const clean = cleanLines.join('\n');

  // Split into blocks by subject (terminated by '.')
  // Simple approach: split on ' .\n' patterns
  const blocks = clean.split(/\s*\.\s*\n/).filter(b => b.trim());

  for (const block of blocks) {
    const trimBlock = block.trim();
    if (!trimBlock) continue;

    // Parse subject
    const firstSpace = trimBlock.search(/\s/);
    if (firstSpace < 0) continue;

    const subjectRaw = trimBlock.slice(0, firstSpace).trim();
    const rest = trimBlock.slice(firstSpace).trim();

    const subjectUri = resolvePrefix(subjectRaw, prefixes);
    const localName = getLocalName(subjectUri);

    if (!entities[subjectUri]) {
      entities[subjectUri] = {
        uri: subjectUri,
        localName,
        types: [],
        properties: {},
      };
    }
    const entity = entities[subjectUri];

    // Parse predicate-object pairs (separated by ;)
    const pairs = rest.split(/\s*;\s*/);
    for (const pair of pairs) {
      const pairTrimmed = pair.trim().replace(/\s*\.\s*$/, '');
      if (!pairTrimmed) continue;

      const predSpace = pairTrimmed.search(/\s/);
      if (predSpace < 0) continue;

      const predRaw = pairTrimmed.slice(0, predSpace).trim();
      const objRaw = pairTrimmed.slice(predSpace).trim();

      const predUri = predRaw === 'a' ? 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : resolvePrefix(predRaw, prefixes);

      // Split objects by comma
      const objects = objRaw.split(/\s*,\s*/).map(o => o.trim()).filter(Boolean);

      for (const obj of objects) {
        const objResolved = obj.startsWith('"') || obj.startsWith("'") ? unquote(obj) : resolvePrefix(obj, prefixes);

        if (predUri === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
          entity.types.push(getLocalName(objResolved));
        } else if (predUri.endsWith('label') || predUri.endsWith('#label')) {
          entity.label = unquote(obj);
        } else if (predUri.endsWith('comment') || predUri.endsWith('#comment')) {
          entity.comment = unquote(obj);
        } else if (predUri.endsWith('description') || predUri.endsWith('#description')) {
          entity.description = unquote(obj);
        } else {
          const predLocal = getLocalName(predUri);
          if (!entity.properties[predLocal]) entity.properties[predLocal] = [];
          entity.properties[predLocal].push(obj.startsWith('"') ? unquote(obj) : getLocalName(objResolved));
        }
      }
    }
  }

  // Categorize
  const classes: OntologyEntity[] = [];
  const properties: OntologyEntity[] = [];
  const instances: OntologyEntity[] = [];
  let ontologyMeta: OntologyEntity | undefined;

  for (const entity of Object.values(entities)) {
    if (entity.types.includes('Ontology')) {
      ontologyMeta = entity;
    } else if (entity.types.some(t => t === 'Class' || t === 'owl:Class')) {
      classes.push(entity);
    } else if (entity.types.some(t => t.includes('Property'))) {
      properties.push(entity);
    } else {
      instances.push(entity);
    }
  }

  return { prefixes, classes, properties, instances, ontologyMeta };
}

// Group instances by their primary type
export function groupByType(instances: OntologyEntity[]): Record<string, OntologyEntity[]> {
  const groups: Record<string, OntologyEntity[]> = {};
  for (const inst of instances) {
    const type = inst.types[0] || 'Other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(inst);
  }
  // Sort groups by name
  const sorted: Record<string, OntologyEntity[]> = {};
  for (const key of Object.keys(groups).sort()) {
    sorted[key] = groups[key].sort((a, b) => (a.label || a.localName).localeCompare(b.label || b.localName));
  }
  return sorted;
}
