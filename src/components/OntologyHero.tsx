interface OntologyHeroProps {
  title: string;
  description: string;
}

const OntologyHero = ({ title, description }: OntologyHeroProps) => {
  return (
    <header className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <p className="text-sm tracking-[0.3em] uppercase text-section-label mb-6">
        rpg-schema.org — Ontology Visualization
      </p>
      <h1 className="text-5xl md:text-7xl font-bold text-gold mb-8 leading-tight">
        D&D SRD 5.2
      </h1>
      <p className="text-lg md:text-xl italic text-parchment max-w-2xl leading-relaxed">
        "{description}"
      </p>
      <div className="flex items-center gap-3 mt-8 text-sm tracking-widest uppercase text-muted-foreground">
        <span>Wizards of the Coast</span>
        <span className="text-gold-dim">•</span>
        <span>Creative Commons 4.0</span>
        <span className="text-gold-dim">•</span>
        <span>RPG Schema + ORAG</span>
      </div>
    </header>
  );
};

export default OntologyHero;
