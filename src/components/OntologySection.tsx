import type { OntologyEntity } from '@/lib/ttl-parser';

interface OntologySectionProps {
  id: string;
  index: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const OntologySection = ({ id, index, title, subtitle, children }: OntologySectionProps) => (
  <section id={id} className="py-16 px-6">
    <div className="max-w-5xl mx-auto">
      <p className="text-section-label text-sm tracking-widest font-mono mb-2">{index}</p>
      <h2 className="text-3xl md:text-4xl font-bold text-gold mb-2">{title}</h2>
      {subtitle && <p className="text-parchment italic mb-8">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </div>
  </section>
);

interface EntityCardProps {
  entity: OntologyEntity;
  showType?: boolean;
}

export const EntityCard = ({ entity, showType }: EntityCardProps) => {
  const name = entity.label || entity.localName;
  const desc = entity.comment || entity.description;
  const importantProps = Object.entries(entity.properties).filter(
    ([key]) => !['name', 'termCode', 'stateDefinedInRuleSet', 'raceDefinedInRuleSet',
      'classDefinedInRuleSet', 'capabilityDefinedInRuleSet', 'rollDefinedInRuleSet',
      'trackerDefinedInRuleSet', 'levelDefinedInRuleSet', 'mappingDefinedInRuleSet',
      'sourceId', 'mediaType', 'sourceVersion', 'license', 'version', 'citation',
      'hasAttributeMapping', 'title', 'inSource'].includes(key)
  );

  return (
    <div className="bg-card-surface rounded-md p-5 border border-gold-dim hover:border-primary/40 transition-colors">
      <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
      {showType && entity.types.length > 0 && (
        <span className="inline-block text-xs font-mono text-gold-dim mt-1 bg-surface-raised px-2 py-0.5 rounded">
          {entity.types.join(', ')}
        </span>
      )}
      {desc && <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{desc}</p>}
      {importantProps.length > 0 && (
        <div className="mt-3 space-y-1">
          {importantProps.map(([key, values]) => (
            <div key={key} className="text-xs">
              <span className="font-mono text-gold-dim">{key}:</span>{' '}
              <span className="text-muted-foreground">{values.join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ClassCardProps {
  entity: OntologyEntity;
}

export const ClassCard = ({ entity }: ClassCardProps) => {
  const name = entity.label || entity.localName;
  const superclass = entity.properties['subClassOf']?.[0];

  return (
    <div className="bg-card-surface rounded-md p-5 border border-gold-dim hover:border-primary/40 transition-colors">
      <h3 className="text-lg font-semibold text-card-foreground">{name}</h3>
      {superclass && (
        <p className="text-xs font-mono text-gold-dim mt-1">
          ↳ extends <span className="text-parchment">{superclass}</span>
        </p>
      )}
      {entity.comment && (
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{entity.comment}</p>
      )}
    </div>
  );
};

interface PropertyCardProps {
  entity: OntologyEntity;
}

export const PropertyCard = ({ entity }: PropertyCardProps) => {
  const name = entity.label || entity.localName;
  const domain = entity.properties['domain']?.[0];
  const range = entity.properties['range']?.[0];

  return (
    <div className="bg-card-surface rounded-md p-5 border border-gold-dim hover:border-primary/40 transition-colors">
      <h3 className="text-base font-semibold text-card-foreground">{name}</h3>
      <div className="flex gap-3 mt-2 text-xs font-mono">
        {domain && (
          <span className="text-gold-dim">
            domain: <span className="text-parchment">{domain}</span>
          </span>
        )}
        {range && (
          <span className="text-gold-dim">
            range: <span className="text-parchment">{range}</span>
          </span>
        )}
      </div>
      <span className="inline-block text-xs font-mono text-muted-foreground mt-1">
        {entity.types.join(', ')}
      </span>
      {entity.comment && (
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{entity.comment}</p>
      )}
    </div>
  );
};
