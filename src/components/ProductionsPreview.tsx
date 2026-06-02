import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Camera, ArrowUpRight } from "lucide-react";

// Import production images
import os1 from "@/assets/OS1.jpg";
import pro5 from "@/assets/pro5.jpg";
import os3 from "@/assets/OS3.jpg";
import pro6 from "@/assets/pro6.jpg";
import os5 from "@/assets/OS5.jpg";
import os6 from "@/assets/OS6.jpg";
import os7 from "@/assets/OS7.jpg";
import os9 from "@/assets/OS9.jpg";
import pro7 from "@/assets/pro7.jpg";
import os11 from "@/assets/OS11.jpg";
import os12 from "@/assets/OS12.jpg";
import ns5 from "@/assets/NS5.jpg";
import nss from "@/assets/NSS.jpg";
import newImg from "@/assets/new.jpg";
import pro1 from "@/assets/pro1.jpg";
import pro2 from "@/assets/pro2.jpg";
import pro3 from "@/assets/pro3.jpg";
import pr4 from "@/assets/pr4.jpg";
import peculiar from "@/assets/peculiar.jpg";

const productions = [
  { id: 1, image: os1, title: "Sartorial Noir", category: "Editorial Campaign", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 2, image: pro5, title: "Urban Genesis", category: "Commercial", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 3, image: os3, title: "Chromatic Shift", category: "Creative Direction", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 4, image: pro6, title: "Ethereal Fall", category: "Seasonal Lookbook", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 5, image: os5, title: "Velocity", category: "Motion & Print", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 6, image: os6, title: "Basquiat's Legacy", category: "Artistic Production", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 7, image: pro1, title: "Urban Odyssey", category: "Commercial", year: "2025", credit: "Ph: Spotlight Studio" },
  { id: 8, image: os9, title: "Neon Pulse", category: "Night Production", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 9, image: pro7, title: "Black is Beautiful", category: "Cultural Spotlight", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 10, image: os11, title: "The Modern Muse", category: "Cover Story", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 11, image: os12, title: "Metropolis", category: "Urban Editorial", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 12, image: ns5, title: "Avant-Garde", category: "Conceptual Art", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 13, image: nss, title: "Serenity", category: "Minimalist Portrait", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 14, image: newImg, title: "Elysian Fields", category: "Editorial Campaign", year: "2025", credit: "Ph: Spotlight Studio" },
  { id: 15, image: os7, title: "Golden Hour", category: "Resort Collection", year: "2024", credit: "Ph: Spotlight Studio" },
  { id: 16, image: pro2, title: "Chromatic Wave", category: "Creative Direction", year: "2025", credit: "Ph: Spotlight Studio" },
  { id: 17, image: pro3, title: "Ethereal Aura", category: "Seasonal Lookbook", year: "2025", credit: "Ph: Spotlight Studio" },
  { id: 18, image: pr4, title: "Metropolis Vision", category: "Urban Editorial", year: "2025", credit: "Ph: Spotlight Studio" },
  { id: 19, image: peculiar, title: "Peculiar Grace", category: "Conceptual Art", year: "2025", credit: "Ph: Spotlight Studio" },
];

const ProductionsPreview = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  
  const imageIndex = Math.abs(page % productions.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.9,
      filter: "blur(10px)",
    }),
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden flex flex-col pt-24 lg:pt-32">
      {/* Background Dynamic Blur */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={`bg-${page}`}
          custom={direction}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src={productions[imageIndex].image}
            alt=""
            className="w-full h-full object-cover blur-[80px] scale-125"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex-1 flex flex-col max-w-[1800px] mx-auto w-full px-5 lg:px-20 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 border-b border-white/10 pb-8">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-white text-5xl lg:text-8xl font-serif font-bold tracking-tighter uppercase"
            >
              Productions
            </motion.h2>
            <p className="text-white/40 text-sm md:text-base font-light tracking-[0.3em] uppercase mt-4">
              Creative Direction / High-End Content / Brand Identity
            </p>
          </div>
          <div className="mt-8 lg:mt-0 flex items-center gap-8">
            <div className="hidden md:block h-[1px] w-32 bg-white/20"></div>
            <div className="text-white font-serif italic text-2xl md:text-4xl">
              {String(imageIndex + 1).padStart(2, '0')} <span className="text-white/20 not-italic text-sm md:text-lg">/ {productions.length}</span>
            </div>
          </div>
        </div>

        {/* Swipe Carousel - True Original Size Fitting */}
        <div className="relative w-full flex items-center justify-center h-[70vh] md:h-[85vh] group">
          <div className="relative w-full h-full flex items-center justify-center">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 35 },
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.6 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) paginate(1);
                  else if (swipe > 10000) paginate(-1);
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
              >
                {/* Tightly Fitted Frame */}
                <div className="relative max-h-full max-w-[95vw] shadow-[0_0_120px_rgba(0,0,0,0.8)] flex rounded-sm overflow-hidden">
                  <div className="absolute inset-0 border border-white/10 z-10 pointer-events-none"></div>
                  <img
                    src={productions[imageIndex].image}
                    alt={productions[imageIndex].title}
                    className="max-h-[70vh] md:max-h-[85vh] w-auto max-w-full object-contain select-none"
                    draggable="false"
                  />
                  
                  {/* Subtle Interactive Overlay */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none transition-opacity duration-300"
                  >
                    <Expand className="text-white/40" size={40} strokeWidth={0.5} />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

            {/* Navigation */}
            <button
              onClick={() => paginate(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-4 text-white/40 hover:text-white transition-colors hidden lg:block"
            >
              <ChevronLeft size={64} strokeWidth={0.5} />
            </button>
            <button
              onClick={() => paginate(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-4 text-white/40 hover:text-white transition-colors hidden lg:block"
            >
              <ChevronRight size={64} strokeWidth={0.5} />
            </button>
          </div>

        {/* Footer Info Panel */}
        <div className="mt-12 lg:mt-16 grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <motion.div
              key={`info-${page}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-2"
            >
              <div className="flex items-center">
                <a
                  href="https://instagram.com/_signature_pictures_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3.5 px-6 py-3.5 rounded-full bg-white/5 border border-white/10 hover:border-white/25 backdrop-blur-md text-white/80 hover:text-white transition-all duration-300 hover:scale-105 active:scale-98 group shadow-soft hover:shadow-medium cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-sm">
                    <Camera size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  
                  <div className="text-left flex flex-col justify-center">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 block font-light leading-none mb-1">
                      Photographer
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold font-sans block leading-none">
                      @_signature_pictures_
                    </span>
                  </div>

                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 ml-1">
                    <ArrowUpRight size={14} />
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-4 flex lg:justify-end gap-2">
            {productions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const diff = index - imageIndex;
                  if (diff !== 0) setPage([page + diff, diff > 0 ? 1 : -1]);
                }}
                className={`h-[2px] transition-all duration-500 ${
                  index === imageIndex ? "bg-white w-12" : "bg-white/10 w-4 hover:bg-white/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductionsPreview;
