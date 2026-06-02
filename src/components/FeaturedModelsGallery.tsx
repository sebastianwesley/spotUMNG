import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Link } from "react-router-dom";
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
    name: "Goodness",
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
    name: "Victory",
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

  return (
    <section className="py-16 lg:py-24 bg-background overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-[60px]">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-[42px] font-sans font-bold text-foreground leading-tight tracking-tight">
            Featured Models
          </h2>
          <p className="mt-4 text-base lg:text-lg text-muted-foreground font-sans font-light max-w-2xl">
            Discover our exceptional talent representing the future of fashion.
          </p>
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

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Model Name - Always Visible */}
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-lg md:text-xl font-sans font-bold text-white mb-1">
                    {model.name}
                  </h3>
                  
                  {/* Stats - Show on Hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ 
                      opacity: hoveredIndex === index ? 1 : 0,
                      y: hoveredIndex === index ? 0 : 8
                    }}
                    transition={{ duration: 0.25 }}
                    className="space-y-0.5 text-xs text-white/80 font-sans font-light"
                  >
                    <p>{model.stats.height}</p>
                    <p>{model.stats.agency}</p>
                  </motion.div>
                </div>

                {/* Arrow indicator */}
                <motion.div
                  className="absolute bottom-5 right-5 text-white"
                  initial={{ opacity: 0.5 }}
                  animate={{ 
                    opacity: hoveredIndex === index ? 1 : 0.5,
                    x: hoveredIndex === index ? 3 : 0
                  }}
                  transition={{ duration: 0.25 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </motion.div>
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
