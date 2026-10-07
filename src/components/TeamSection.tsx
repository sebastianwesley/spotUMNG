import { useEffect, useRef, useState } from "react";
import { Instagram, Linkedin } from "lucide-react";

const team = [
  {
    name: "Alexandra Chen",
    role: "Founder & Creative Director",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    quote: "Every model should walk into a room and own it.",
    social: { instagram: "#", linkedin: "#" },
  },
  {
    name: "Marcus Williams",
    role: "Head of Scouting",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    quote: "Raw talent is everywhere. We just know where to look.",
    social: { instagram: "#", linkedin: "#" },
  },
  {
    name: "Sofia Reyes",
    role: "Development Coach",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    quote: "Growth happens when you step outside your comfort zone.",
    social: { instagram: "#", linkedin: "#" },
  },
  {
    name: "David Park",
    role: "Production Manager",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    quote: "Every frame tells a story worth remembering.",
    social: { instagram: "#", linkedin: "#" },
  },
];

const TeamSection = () => {
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
      id="team"
      className="py-20 lg:py-28 bg-background"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px]">
        {/* About Intro */}
        <div className={`text-center mb-20 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-[48px] font-sans font-bold text-foreground mb-6 tracking-tight">
            SpotlightU is a Movement.
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-[800px] mx-auto leading-relaxed font-sans font-light">
            At SpotlightU, we champion a new standard of modeling — one rooted in intentional growth, creative diversity, and global relevance. We don't just book talent. We build them. Our team fuses fashion, technology, and human development to create pathways for modern models to thrive.
          </p>
        </div>

        {/* Team Header */}
        <div className={`text-center mb-12 ${isVisible ? "animate-fade-in-up-delay-1" : "opacity-0"}`}>
          <h3 className="text-2xl md:text-3xl font-sans font-bold text-foreground mb-3 tracking-tight">
            The Minds Behind the Movement
          </h3>
          <p className="text-muted-foreground font-sans font-light">
            A collective of creatives, strategists, and fashion visionaries.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div
              key={member.name}
              className={`group text-center ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${(index + 2) * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative mb-6 mx-auto w-48 h-48 lg:w-56 lg:h-56 overflow-hidden rounded-full">
                <img loading="lazy" decoding="async"
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                />
                {/* Social Overlay */}
                <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                  <a
                    href={member.social.instagram}
                    className="p-2 bg-background rounded-full text-foreground hover:bg-accent hover:text-background transition-colors duration-300"
                    aria-label={`${member.name} Instagram`}
                  >
                    <Instagram size={20} />
                  </a>
                  <a
                    href={member.social.linkedin}
                    className="p-2 bg-background rounded-full text-foreground hover:bg-accent hover:text-background transition-colors duration-300"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </div>

              {/* Info */}
              <h4 className="text-lg font-sans font-bold text-foreground uppercase tracking-wide mb-1">
                {member.name}
              </h4>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-3 font-sans font-light">
                {member.role}
              </p>
              <p className="text-sm font-sans italic text-foreground/70 font-light">
                "{member.quote}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
