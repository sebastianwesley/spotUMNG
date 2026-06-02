import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AboutPreview = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 lg:py-28 bg-background overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px]">
        {/* Main About Section */}
        <div className={`${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-sans font-bold text-foreground mb-8 leading-tight tracking-tight">
            About Spotlight Management
          </h2>
          <div className="max-w-4xl">
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-sans font-light">
              Founded in 2020 by Sebastian Wesley, Spotlight Management is a solution-driven management built on ethics and innovation. Evolving from a local production house in Omoku, Rivers State, into a strategic talent network, the management provides more than mere representation...
            </p>
          </div>
          <Link
            to="/about"
            className="inline-block mt-8 px-6 py-3 border border-foreground text-foreground font-sans font-medium uppercase tracking-wider text-sm transition-all duration-300 hover:bg-foreground hover:text-background"
          >
            Read More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
