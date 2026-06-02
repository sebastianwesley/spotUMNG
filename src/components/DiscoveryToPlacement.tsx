import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import { Link } from "react-router-dom";
import discoveryImage from "@/assets/discovery-to-placement.jpg";
import bomaSundayImage from "@/assets/boma-sunday-celine.jpg";
import osohIfeayiImage from "@/assets/Genevieve.jpg";

const placementImages = [
  { src: discoveryImage, alt: "Spotlight x Adaora - Gucci Fashion Week 2025", name: "Success Nwokocha", textColor: "text-white", position: "bottom-12", bgClass: "", profilePath: "/placements/success-nwokocha" },
  { src: bomaSundayImage, alt: "Spotlight x Sir R - Celine PFW", name: "Boma Sunday", textColor: "text-black", position: "bottom-20", bgClass: "bg-white/70 px-2.5 py-0.5 rounded-sm", profilePath: "/placements/boma-sunday" },
  { src: osohIfeayiImage, alt: "Spotlight Placement - Osoh Ifeanyi", name: "Osoh Ifeanyi", textColor: "text-white", position: "bottom-12", bgClass: "", profilePath: "/placements/usoh-ifeanyi" },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const DiscoveryToPlacement = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(([prev]) => [(prev + 1) % placementImages.length, 1]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-background overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
          className="font-serif text-3xl md:text-4xl lg:text-5xl mb-12 md:mb-16 text-foreground tracking-tight"
        >
          From Discovery to Placement
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 1.04 }}
          animate={
            isInView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 12, scale: 1.04 }
          }
          transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 }}
          className="relative w-full max-w-2xl mx-auto aspect-[3/4] md:aspect-[4/5] rounded-xl overflow-hidden shadow-2xl"
        >
          <Link to={placementImages[currentIndex].profilePath} className="block w-full h-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.img
                key={currentIndex}
                src={placementImages[currentIndex].src}
                alt={placementImages[currentIndex].alt}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                }}
                className="absolute inset-0 w-full h-full object-cover object-top cursor-pointer"
              />
            </AnimatePresence>
            
            {/* Name overlay */}
            {placementImages[currentIndex].name && (
              <div className={`absolute ${placementImages[currentIndex].position} left-1/2 -translate-x-1/2 z-10`}>
                <span className={`${placementImages[currentIndex].textColor} ${placementImages[currentIndex].bgClass} text-sm md:text-base uppercase tracking-[0.3em] font-light drop-shadow-lg`}>
                  {placementImages[currentIndex].name}
                </span>
              </div>
            )}
          </Link>
          
          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {placementImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex([index, index > currentIndex ? 1 : -1])}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1], delay: 0.4 }}
          className="mt-8 md:mt-12 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
        >
          Our journey began in 2023 with a single mission: to discover the undiscovered. Today, we are proud to have scouted and transitioned a roster of rising stars into the hands of reputable mother agents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1], delay: 0.6 }}
        >
          <Link to="/placements">
            <button className="mt-8 px-10 py-3 border border-zinc-300 text-zinc-800 text-[10px] uppercase tracking-[0.3em] font-light hover:bg-black hover:text-white hover:border-black transition-all duration-500 ease-in-out">
              Explore Placements
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default DiscoveryToPlacement;
