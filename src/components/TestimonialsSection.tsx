import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const updates = [
  {
    id: 1,
    title: "United for Sustainable Fashion",
    description: "Spotlight drives sustainable industry practices by forging strategic alliances with eco-conscious brands to collectively enforce ethical modeling standards and conscious and collaborative fashion productions.",
    date: "May 2026",
  },
  {
    id: 2,
    title: "Human-Centric Model Development",
    description: "We are scaling and relaunching our development program with a renewed commitment to personal growth, human-centric design, and solution-oriented results.",
    date: "April 2026",
  },
  {
    id: 3,
    title: "Building Our Vision",
    description: "We are actively building our upcoming production structure and network. Driven by our vision to bridge global opportunities, we are constructing a next-generation platform for models and fashion creatives.",
    date: "March 2026",
  },
];

const SpotlightUpdates = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % updates.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextUpdate = () => {
    setCurrentIndex((prev) => (prev + 1) % updates.length);
  };

  const prevUpdate = () => {
    setCurrentIndex((prev) => (prev - 1 + updates.length) % updates.length);
  };

  return (
    <section
      ref={sectionRef}
      id="updates"
      className="py-20 lg:py-28 bg-foreground text-background overflow-hidden"
    >
      <div className="max-w-[1000px] mx-auto px-5 lg:px-[60px]">
        {/* Header */}
        <div className={`text-center mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-sans font-bold mb-4 tracking-tight">
            Spotlight Updates
          </h2>
          <p className="text-lg text-background/70 font-sans font-light">
            Latest news and announcements from SpotlightU
          </p>
        </div>

        {/* Updates Carousel */}
        <div 
          className={`relative ${isVisible ? "animate-fade-in-up-delay-1" : "opacity-0"}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="text-center">
            <div className="relative min-h-[200px]">
              {updates.map((update, index) => (
                <div
                  key={update.id}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === currentIndex
                      ? "opacity-100 translate-x-0"
                      : index < currentIndex
                      ? "opacity-0 -translate-x-full"
                      : "opacity-0 translate-x-full"
                  }`}
                >
                  <p className="text-sm text-background/50 font-sans mb-4">{update.date}</p>
                  <h3 className="text-2xl lg:text-3xl font-sans font-bold mb-6 max-w-[800px] mx-auto">
                    {update.title}
                  </h3>
                  <p className="text-lg lg:text-xl font-sans font-light leading-relaxed max-w-[700px] mx-auto text-background/80">
                    {update.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={prevUpdate}
              className="p-3 border border-background/30 rounded-full hover:bg-background hover:text-foreground transition-all duration-300"
              aria-label="Previous update"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2">
              {updates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-background w-8"
                      : "bg-background/30 hover:bg-background/50"
                  }`}
                  aria-label={`Go to update ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextUpdate}
              className="p-3 border border-background/30 rounded-full hover:bg-background hover:text-foreground transition-all duration-300"
              aria-label="Next update"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpotlightUpdates;
