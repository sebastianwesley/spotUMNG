import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import nessy1Img from "@/assets/nessy1.jpg";
import nessy2Img from "@/assets/nessy2.jpg";
import paul1Img from "@/assets/paul1.jpg";
import paul2Img from "@/assets/paul2.jpg";
import goodnessImg from "@/assets/goodness_new.jpg";
import victoryImg from "@/assets/OLV.jpg";

// Featured models data
const featuredModels = [
  {
    id: 2,
    name: "Paul Thompson",
    image: paul1Img,
    stats: { agency: "Spotlight" },
    profilePath: "/placements/paul-thompson",
  },
  {
    id: 3,
    name: "Ezi Goodness",
    image: goodnessImg,
    stats: { height: "5'9\"", agency: "Next London" },
  },
  {
    id: 4,
    name: "Ahiakwo Nessy",
    image: nessy2Img,
    stats: { height: "5'10\"", agency: "Storm Models" },
  },
  {
    id: 5,
    name: "Willie Victory",
    image: victoryImg,
    stats: { height: "5'11\"", agency: "Spotlight" },
    profilePath: "/placements/victory",
  },
];

// Slide dimensions - larger cards matching reference design
const GAP = 24;

const FeaturedModelsGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  // Motion value for tracking position
  const x = useMotionValue(0);

  // Calculate constraints on mount and resize
  useEffect(() => {
    const updateConstraints = () => {
      if (!containerRef.current || !trackRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const trackWidth = trackRef.current.scrollWidth;
      const maxDrag = Math.min(0, containerWidth - trackWidth - 40);
      setConstraints({ left: maxDrag, right: 0 });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  // Update button states based on scroll position
  useEffect(() => {
    const checkButtons = () => {
      const currentX = x.get();
      setCanScrollLeft(currentX < -5);
      setCanScrollRight(currentX > constraints.left + 5);
    };

    checkButtons();
    const unsubscribe = x.on("change", checkButtons);
    return () => unsubscribe();
  }, [x, constraints]);

  // Handle drag end with momentum
  const handleDragEnd = (_: never, info: { velocity: { x: number }; offset: { x: number } }) => {
    const currentX = x.get();
    const velocity = info.velocity.x;
    
    // Calculate target with momentum
    let targetX = currentX + velocity * 0.2;
    
    // Clamp to constraints
    targetX = Math.max(constraints.left, Math.min(constraints.right, targetX));
    
    // Animate to target position smoothly
    animate(x, targetX, {
      type: "spring",
      stiffness: 400,
      damping: 40,
    });
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!containerRef.current || !trackRef.current) return;
    const currentX = x.get();
    
    // Scroll by roughly 1 card width + gap
    const step = 444; 
    let targetX = direction === "left" ? currentX + step : currentX - step;
    
    // Clamp to constraints
    targetX = Math.max(constraints.left, Math.min(constraints.right, targetX));
    
    animate(x, targetX, {
      type: "spring",
      stiffness: 150,
      damping: 20,
    });
  };

  return (
    <section className="py-16 lg:py-24 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-[60px]">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-sans font-bold text-foreground leading-tight tracking-tight">
            Featured Models
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-full border-2 border-foreground/30 flex items-center justify-center transition-all duration-300 active:scale-95 ${
                canScrollLeft 
                  ? "hover:bg-foreground hover:text-background hover:border-foreground cursor-pointer text-foreground" 
                  : "opacity-30 cursor-not-allowed text-muted-foreground/60 border-foreground/10"
              }`}
              aria-label="Previous models"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-full border-2 border-foreground/30 flex items-center justify-center transition-all duration-300 active:scale-95 ${
                canScrollRight 
                  ? "hover:bg-foreground hover:text-background hover:border-foreground cursor-pointer text-foreground" 
                  : "opacity-30 cursor-not-allowed text-muted-foreground/60 border-foreground/10"
              }`}
              aria-label="Next models"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Container */}
      <div 
        ref={containerRef}
        className="relative cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          ref={trackRef}
          className="flex px-5 lg:px-[60px]"
          style={{ x, gap: GAP }}
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {featuredModels.map((model, index) => (
            <motion.div
              key={model.id}
              className="relative flex-shrink-0 overflow-hidden bg-muted group cursor-pointer"
              style={{
                width: 'calc(85vw - 40px)',
                maxWidth: '420px',
                aspectRatio: '3/4',
              }}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <Link to={model.profilePath || "/models"} className="block w-full h-full">
                {/* Image */}
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Swipe Hint - Mobile Only */}
        <div className="mt-4 px-5 text-muted-foreground/50 text-xs font-light text-center md:hidden">
          ← Swipe to explore →
        </div>
      </div>
    </section>
  );
};

export default FeaturedModelsGallery;
