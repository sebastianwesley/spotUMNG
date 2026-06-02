import { useEffect, useRef, useState } from "react";

const ModelDevelopment = () => {
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
      className="py-20 lg:py-32 bg-secondary relative overflow-hidden"
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[15vw] font-bold text-foreground/[0.03] uppercase tracking-widest">
          DEVELOP
        </span>
      </div>

      <div className="max-w-[800px] mx-auto px-5 lg:px-[60px] relative z-10">
        <div className={`text-center ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-[48px] font-sans font-bold text-foreground mb-8 leading-tight tracking-tight">
            The SpotlightU Shift
          </h2>
          
          <div className="space-y-6 text-base lg:text-lg text-muted-foreground mb-10 leading-relaxed font-sans font-light text-center max-w-[720px] mx-auto">
            <p>
              Let’s be honest: a runway can’t make you a model. <span className="font-semibold text-foreground">Only you</span> can do that.
            </p>
            <p>
              The real transformation doesn’t happen under flashing cameras. It happens in the quiet moments when you’re building the <span className="font-semibold text-foreground">mental grit</span> to survive the pressure, <span className="font-semibold text-foreground">conditioning your body</span>, and mastering the <span className="font-semibold text-foreground">business skills</span> to protect your craft.
            </p>
            <p>
              When you refine who you are on the inside, the industry has <span className="font-semibold text-foreground">no choice but to notice</span>.
            </p>
            <p>
              Suddenly, you walk into a room and the energy shifts. The constant anxiety of "Will I make it?" or "Am I getting ripped off?" completely melts away, replaced by a deep, beautiful <span className="font-bold text-foreground tracking-wide">peace of mind</span>. Because you finally know your worth and understand the business, your career isn't a fleeting trend, it’s <span className="font-semibold text-foreground">built to last</span>.
            </p>
            <p>
              That is real freedom. You aren't waiting for someone to hand you a spotlight. You’ve built the <span className="font-semibold text-foreground">fire inside yourself</span>.
            </p>
          </div>

          {/* Quote Strip */}
          <div className="py-8 border-t border-b border-border mb-10">
            <blockquote className="text-xl lg:text-2xl font-sans italic text-foreground/80 mb-2 font-light">
              "SpotlightU. Master yourself. Command the light."
            </blockquote>
            <cite className="text-sm uppercase tracking-widest text-muted-foreground font-sans">
              — SpotlightU Philosophy
            </cite>
          </div>

          <div className="space-y-4">
            <p className="text-lg font-sans italic text-foreground/80 font-light">
              Ready to grow into your spotlight?
            </p>
            <a
              href="/apply"
              className="btn-hero-primary inline-block"
            >
              Apply for Development
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelDevelopment;
