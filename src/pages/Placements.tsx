import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import successImage from "@/assets/success-nwokocha.jpg";
import bomaImage from "@/assets/boma-sunday.jpg";
import osohImage from "@/assets/Genevieve.jpg";

const placedModels = [
  {
    id: 1,
    name: "Success Nwokocha",
    brand: "Adaora Model Management",
    fontClass: "font-gucci",
    image: successImage,
    profilePath: "/placements/success-nwokocha",
  },
  {
    id: 2,
    name: "Boma Sunday",
    brand: "Ekwere Models",
    fontClass: "font-celine",
    image: bomaImage,
    profilePath: "/placements/boma-sunday",
  },
  {
    id: 3,
    name: "Usoh Ifeanyi",
    brand: "Ekwere Models",
    fontClass: "font-gucci",
    image: osohImage,
    profilePath: "/placements/usoh-ifeanyi",
  },
];

const Placements = () => {
  const navigate = useNavigate();
  const [revealedIds, setRevealedIds] = useState<number[]>([]);

  const handleImageClick = (id: number, profilePath: string | null) => {
    if (revealedIds.includes(id)) {
      // Already revealed, navigate to model's dedicated page or models page
      if (profilePath) {
        navigate(profilePath);
      } else {
        navigate("/models");
      }
    } else {
      // Reveal color
      setRevealedIds((prev) => [...prev, id]);
    }
  };

  const isRevealed = (id: number) => revealedIds.includes(id);

  return (
    <>
      <Helmet>
        <title>Placements | SpotlightU</title>
        <meta
          name="description"
          content="Discover the models scouted by Spotlight and successfully placed with leading agencies worldwide."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Our Placements
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light">
              Discover the models scouted by Spotlight and successfully placed.
            </p>
            <p className="text-muted-foreground/60 text-sm mt-4 italic">
              Click to spotlight • Click again to explore
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {placedModels.map((model, index) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                className="relative cursor-pointer"
                onClick={() => handleImageClick(model.id, model.profilePath)}
              >
                <div className="aspect-[3/4] overflow-hidden rounded-2xl relative group">
                  <img loading="lazy" decoding="async"
                    src={model.image}
                    alt={model.name}
                    className={`w-full h-full object-cover transition-all duration-1000 ease-out ${
                      isRevealed(model.id) ? "grayscale-0 scale-105" : "grayscale"
                    }`}
                  />
                  
                  {/* Overlay gradient */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-700 ${
                      isRevealed(model.id) ? "opacity-80" : "opacity-50"
                    }`} 
                  />

                  {/* Model Name & Brand - positioned at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center">
                    <div className="px-4 py-3">
                      <h2 
                        className={`${model.fontClass} text-lg md:text-xl lg:text-2xl text-white tracking-[0.1em] uppercase transition-all duration-700 text-center`}
                        style={{
                          textShadow: "0 2px 15px rgba(0,0,0,0.6)",
                          letterSpacing: model.fontClass === "font-celine" ? "0.15em" : "0.08em"
                        }}
                      >
                        {model.name}
                      </h2>
                      <p 
                        className="text-white/80 text-[9px] md:text-xs uppercase tracking-[0.2em] mt-2 text-center"
                        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
                      >
                        Placed with {model.brand}
                      </p>
                    </div>
                    
                    {/* Explore button - appears after reveal */}
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: isRevealed(model.id) ? 1 : 0,
                        y: isRevealed(model.id) ? 0 : 10
                      }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="mt-3"
                    >
                      <span className="text-white text-xs uppercase tracking-[0.2em] bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors">
                        Click to spotlight
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center text-muted-foreground mt-24 max-w-xl mx-auto font-light leading-relaxed"
          >
            Our structured pipeline transforms raw potential into internationally recognized talent. 
            From discovery to placement, we guide aspiring models through every step of their journey.
          </motion.p>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Placements;