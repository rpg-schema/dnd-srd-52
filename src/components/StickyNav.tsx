import { Download } from "lucide-react";

interface NavSection {
  id: string;
  label: string;
}

interface StickyNavProps {
  sections: NavSection[];
  ttlUrl: string;
}

const StickyNav = ({ sections, ttlUrl }: StickyNavProps) => {
  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = ttlUrl;
    a.download = "srd52-rpg-orag.ttl";
    a.click();
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-gold-dim">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <span className="font-mono text-xs tracking-widest uppercase text-gold-dim font-semibold">SRD 5.5 Schema</span>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-5 text-xs tracking-widest uppercase text-muted-foreground">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-gold transition-colors">
                {s.label}
              </a>
            ))}
          </div>
          <div className="border-l border-gold-dim pl-4 ml-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-gold transition-colors"
            >
              <Download size={14} />
              TTL
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default StickyNav;
