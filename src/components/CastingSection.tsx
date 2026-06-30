import { useEffect, useRef, useState } from "react";
import { Phone, Mail, ArrowRight, Sparkles } from "lucide-react";

const CastingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getWhatsAppLinkText = () => {
    return "Hello Spotlight Team,\n\nI would like to inquire about casting and booking models for an upcoming project.";
  };

  const getWhatsAppLink = () => {
    return `https://wa.me/2348051586944?text=${encodeURIComponent(getWhatsAppLinkText())}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent("Casting Booking Inquiry");
    return `mailto:spotlightmng@outlook.com?subject=${subject}&body=${encodeURIComponent(getWhatsAppLinkText())}`;
  };

  return (
    <section
      ref={sectionRef}
      id="book"
      className="py-20 lg:py-32 bg-secondary relative overflow-hidden"
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[15vw] font-bold text-foreground/[0.02] uppercase tracking-widest">
          CONTACT
        </span>
      </div>

      <div className="max-w-[700px] mx-auto px-5 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-[40px] font-sans font-bold text-foreground mb-4 leading-tight tracking-tight uppercase">
            Select Your Contact Method
          </h2>
          <p className="text-sm lg:text-base text-muted-foreground leading-relaxed font-sans font-light max-w-xl mx-auto">
            Get in touch with our team for inquiries,.
          </p>
        </div>

        {/* Direct Premium Action Center */}
        <div 
          className={`space-y-6 ${
            isVisible ? "animate-fade-in-up-delay-1" : "opacity-0"
          }`}
        >
          <div className="bg-background rounded-3xl p-6 lg:p-8 border border-border shadow-soft">
            <div className="space-y-4">
              {/* WhatsApp Action Card */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 block cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
                    Direct WhatsApp Booking
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </span>
                  <h4 className="font-sans font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                    +234 8051586944
                  </h4>
                  <p className="text-xs text-muted-foreground font-light leading-normal">
                    Click to initiate a chat. Highly recommended for instant response.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground absolute top-5 right-5 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
              </a>

              {/* Email Action Card */}
              <a
                href={getEmailLink()}
                className="group relative flex items-start gap-4 p-5 rounded-2xl bg-accent/[0.03] border border-accent/10 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 block cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-accent">
                    Official Email Inquiry
                  </span>
                  <h4 className="font-sans font-bold text-foreground group-hover:text-accent transition-colors break-all">
                    spotlightmng@outlook.com
                  </h4>
                  <p className="text-xs text-muted-foreground font-light leading-normal">
                    Click to write an email. Best for detailed briefs and official RFPs.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground absolute top-5 right-5 group-hover:translate-x-1 group-hover:text-accent transition-all" />
              </a>
            </div>
          </div>

          {/* Visual Quote / Trajectory Statement */}
          <div className="bg-foreground rounded-3xl p-6 lg:p-8 text-background relative overflow-hidden shadow-medium text-center">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-background/[0.03] rounded-full border border-background/[0.05]" />
            <blockquote className="text-base font-sans italic mb-4 relative z-10 leading-relaxed font-light text-center">
              "Out of the shadows. Into the spotlight."
            </blockquote>
            <div className="text-xs uppercase tracking-widest text-background/60 font-sans font-bold">
              — SpotlightU
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CastingSection;
