import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import successNwokochaImg from "@/assets/success-nwokocha.webp";
import bomaSundayImg from "@/assets/boma-sunday.webp";
import osohIfeayiImg from "@/assets/Genevieve.webp";
import nessy1Img from "@/assets/nessy1.webp";
import nessy2Img from "@/assets/nessy2.webp";
import paul1Img from "@/assets/paul1.webp";
import paul2Img from "@/assets/paul2.webp";
import goodnessImg from "@/assets/goodness_new.webp";
import victoryImg from "@/assets/OLV.webp";

const models = [
  {
    id: 2,
    name: "Paul Thompson",
    image: paul1Img,
    stats: { city: "Lagos" },
    type: "Men",
    profilePath: "/placements/paul-thompson",
  },
  {
    id: 3,
    name: "Ezi Goodness",
    image: goodnessImg,
    stats: { height: "5'9\"", city: "London" },
    type: "Women",
  },
  {
    id: 4,
    name: "Ahiakwo Nessy",
    image: nessy2Img,
    stats: { height: "5'10\"", city: "Lagos" },
    type: "Women",
  },
  {
    id: 5,
    name: "Willie Victory",
    image: victoryImg,
    stats: { height: "5'11\"", city: "Lagos" },
    type: "Women",
    profilePath: "/placements/victory",
  },
];

const placedModels = [
  {
    id: 101,
    name: "Success Nwokocha",
    image: successNwokochaImg,
    stats: { height: "6'0\"", city: "Lagos" },
    type: "Placements",
    profilePath: "/placements/success-nwokocha",
  },
  {
    id: 102,
    name: "Boma Sunday",
    image: bomaSundayImg,
    stats: { height: "6'1\"", city: "Lagos" },
    type: "Placements",
    profilePath: "/placements/boma-sunday",
  },
  {
    id: 103,
    name: "Osoh Ifeanyi",
    image: osohIfeayiImg,
    stats: { height: "5'9.7\"", city: "Lagos" },
    type: "Placements",
    profilePath: "/placements/usoh-ifeanyi",
  },
];

const categories = ["Developed Models", "Women", "Men", "Placements"];

const PortfolioShowcase = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Developed Models");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

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

  const getDisplayModels = () => {
    if (activeCategory === "Placements") {
      return placedModels;
    }
    if (activeCategory === "Developed Models") {
      return models;
    }
    return models.filter(model => model.type === activeCategory);
  };

  const filteredModels = getDisplayModels();

  const handleModelClick = (model: typeof placedModels[0] | typeof models[0]) => {
    if ('profilePath' in model && model.profilePath) {
      navigate(model.profilePath);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="portfolio"
      className="py-24 lg:py-32 bg-background"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px]">
        {/* Header with Tab Filters */}
        <div className={`mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          {/* Title */}
          <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-[0.1em] uppercase text-foreground mb-12">
            Models
          </h2>
          
          {/* Tab Filters */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 md:gap-x-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`relative text-xs md:text-sm lg:text-base tracking-[0.2em] md:tracking-[0.3em] uppercase font-light transition-all duration-300 pb-2 ${
                  activeCategory === category 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
                {/* Active indicator line */}
                <span 
                  className={`absolute bottom-0 left-0 w-full h-[1px] bg-foreground transition-transform duration-300 origin-left ${
                    activeCategory === category ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ))}
          </div>
          
          {/* Section Description */}
          {activeCategory === "Developed Models" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8 space-y-2"
            >
              <p className="text-muted-foreground text-xs md:text-sm tracking-[0.2em] uppercase font-light max-w-3xl mx-auto leading-relaxed">
                Spotlight runs an <span className="text-foreground font-medium">Open Model Development Session</span> — these models went through our{" "}
                <span className="text-foreground font-medium">Model Development Program</span>.
              </p>
            </motion.div>
          )}
        </div>

        {/* Model Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredModels.map((model, index) => (
            <div
              key={model.id}
              className={`group relative cursor-pointer ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 0.08}s` }}
              onMouseEnter={() => setHoveredId(model.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleModelClick(model)}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <img loading="lazy" decoding="async"
                  src={model.image}
                  alt={model.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    hoveredId === model.id ? "scale-105 grayscale-0" : "scale-100 grayscale"
                  }`}
                />


              </div>

              {/* Model Info - Always visible below image */}
              <div className="pt-4 pb-2">
                <h3 className="text-sm md:text-base font-sans font-medium tracking-[0.1em] uppercase text-foreground">
                  {model.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioShowcase;
