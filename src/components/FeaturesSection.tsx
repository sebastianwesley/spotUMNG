import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
const RococoBackground = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-35 group-hover:opacity-75 transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 select-none pointer-events-none text-foreground group-hover:text-background">
    {/* Ornate French Rococo swirl paths and floral baroque flourishes */}
    <path d="M4 32C4 20 12 12 24 10C28 9 32 12 30 16C28 20 22 20 20 17C18 14 22 8 28 6C36 4 48 8 52 18C54 22 51 26 47 25C43 24 43 18 47 16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <path d="M60 32C60 44 52 52 40 54C36 55 32 52 34 48C36 44 42 44 44 47C46 50 42 56 36 58C28 60 16 56 12 46C10 42 13 38 17 39C21 40 21 46 17 48" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    {/* Concentric ornate dashes */}
    <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
    {/* Intricate accent frame elements */}
    <path d="M8 8C12 12 12 18 8 20" stroke="currentColor" strokeWidth="0.75" />
    <path d="M56 56C52 52 52 46 56 44" stroke="currentColor" strokeWidth="0.75" />
    <path d="M56 8C52 12 46 12 44 8" stroke="currentColor" strokeWidth="0.75" />
    <path d="M8 56C12 52 18 52 20 56" stroke="currentColor" strokeWidth="0.75" />
  </svg>
);

const features = [
  {
    lettermark: "MD",
    title: "Model Development",
    description: "We train talent physically, mentally, and emotionally for international market standards.",
    href: "/development"
  },
  {
    lettermark: "SC",
    title: "Scouting",
    description: "We find raw, diverse talent with potential and guide them toward discovery.",
    href: "/apply"
  },
  {
    lettermark: "PR",
    title: "Productions",
    description: "SpotlightU produces fashion-forward content for portfolios, campaigns, and social media.",
    href: "/productions"
  },
];

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-28 bg-secondary"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px]">
        {/* Header */}
        <div className={`text-center mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-sans font-bold text-foreground mb-4 tracking-tight">
            What We Do Best
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-[600px] mx-auto font-sans font-light">
            SpotlightU combines expertise and creativity to fuel careers in fashion.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to={feature.href}
              className={`group bg-background rounded-2xl p-8 border border-border shadow-soft transition-all duration-300 hover:-translate-y-2 hover:shadow-lift ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-background border-2 border-foreground shadow-medium transition-all duration-500 group-hover:bg-foreground group-hover:shadow-lift relative overflow-hidden shrink-0">
                <RococoBackground />
                <span className="font-serif text-xl font-bold tracking-wider text-foreground group-hover:text-background transition-all duration-500 group-hover:scale-110 group-hover:tracking-widest select-none relative z-10">
                  {feature.lettermark}
                </span>
              </div>
              <h3 className="text-lg font-sans font-bold text-foreground mb-3 uppercase tracking-wide">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-sans font-light">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className={`mt-16 text-center ${isVisible ? "animate-fade-in-up-delay-3" : "opacity-0"}`}>
          <Link
            to="/productions"
            className="inline-flex items-center text-foreground font-medium border-b-2 border-foreground pb-1 transition-all duration-300 hover:text-accent hover:border-accent"
          >
            Explore Our Work in Action
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
