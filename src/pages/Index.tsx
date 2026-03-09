import { useEffect, useState } from "react";
import { parseTTL, groupByType, type OntologyData } from "@/lib/ttl-parser";
import OntologyHero from "@/components/OntologyHero";
import StickyNav from "@/components/StickyNav";
import { OntologySection, ClassCard, PropertyCard, EntityCard } from "@/components/OntologySection";
import Footer from "@/components/Footer";

const TTL_URL = "/srd52-rpg-orag.ttl";

const NAV_SECTIONS = [
  { id: "classes", label: "Classes" },
  { id: "properties", label: "Properties" },
  { id: "abilities", label: "Abilities" },
  { id: "skills", label: "Skills" },
  { id: "actions", label: "Actions" },
  { id: "instances", label: "Instances" },
];

const Index = () => {
  const [data, setData] = useState<OntologyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(TTL_URL)
      .then((r) => r.text())
      .then((ttl) => setData(parseTTL(ttl)))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load ontology: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading ontology…</p>
      </div>
    );
  }

  const grouped = groupByType(data.instances);
  const description =
    data.ontologyMeta?.comment ||
    data.ontologyMeta?.properties?.["description"]?.[0] ||
    "D&D SRD 5.2 profile for RPG Schema";

  // Pull out specific groups for dedicated sections
  const abilityScores = grouped["AbilityScore"] || [];
  const skills = grouped["Skill"] || [];
  const actions = grouped["Action"] || [];

  // Remaining instance groups
  const remainingGroups = Object.entries(grouped).filter(
    ([type]) => !["AbilityScore", "Skill", "Action"].includes(type),
  );

  let sectionIdx = 0;
  const idx = () => `§${String(++sectionIdx).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-background">
      <OntologyHero title="D&D SRD 5.5" description={description} />
      <StickyNav sections={NAV_SECTIONS} ttlUrl={TTL_URL} />

      <OntologySection
        id="classes"
        index={idx()}
        title="Classes"
        subtitle="OWL class definitions in the SRD 5.2 ontology"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.classes.map((c) => (
            <ClassCard key={c.uri} entity={c} />
          ))}
        </div>
      </OntologySection>

      <OntologySection
        id="properties"
        index={idx()}
        title="Properties"
        subtitle="Object and datatype properties linking SRD concepts"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {data.properties.map((p) => (
            <PropertyCard key={p.uri} entity={p} />
          ))}
        </div>
      </OntologySection>

      <OntologySection
        id="abilities"
        index={idx()}
        title="Ability Scores"
        subtitle="The six core abilities and their canonical mappings"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {abilityScores.map((e) => (
            <EntityCard key={e.uri} entity={e} />
          ))}
        </div>
      </OntologySection>

      <OntologySection id="skills" index={idx()} title="Skills" subtitle="D&D skill proficiencies keyed to abilities">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((e) => (
            <EntityCard key={e.uri} entity={e} />
          ))}
        </div>
      </OntologySection>

      <OntologySection
        id="actions"
        index={idx()}
        title="Actions"
        subtitle="Action economy entries available in combat and exploration"
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((e) => (
            <EntityCard key={e.uri} entity={e} />
          ))}
        </div>
      </OntologySection>

      <div id="instances">
        {remainingGroups.map(([type, entities]) => (
          <OntologySection
            key={type}
            id={`type-${type.toLowerCase()}`}
            index={idx()}
            title={type.replace(/([A-Z])/g, " $1").trim()}
            subtitle={`${entities.length} ${type} instance${entities.length !== 1 ? "s" : ""}`}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {entities.map((e) => (
                <EntityCard key={e.uri} entity={e} showType />
              ))}
            </div>
          </OntologySection>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Index;
