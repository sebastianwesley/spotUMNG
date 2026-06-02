import { useState, useEffect } from "react";

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-black">
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-5">
          {/* Main Title with Spotlight Effect */}
          <h1 
            className={`text-[8.5vw] sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-all duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            SpotlightU
          </h1>
          
          {/* Tagline */}
          <p 
            className={`text-lg md:text-xl text-white/80 tracking-widest uppercase transition-all duration-700 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Discovering Exceptional Talents
          </p>

          {/* Decorative Line */}
          <div 
            className={`w-24 h-[1px] bg-white/50 mx-auto mt-8 transition-all duration-700 delay-700 ${
              isLoaded ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-white/60 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
