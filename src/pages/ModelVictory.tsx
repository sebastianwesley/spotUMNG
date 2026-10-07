import { forwardRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageLightbox from "@/components/ImageLightbox";
import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";
import portraitImage from "@/assets/OLV.webp";
import olv1 from "@/assets/OLV1.webp";
import olv2 from "@/assets/OLV2.webp";
import olv3 from "@/assets/OLV3.webp";

const galleryImages = [
  { src: portraitImage, alt: "Willie Victory - Portrait", brand: null },
  { src: olv1, alt: "Willie Victory - Editorial", brand: null },
  { src: olv2, alt: "Willie Victory - Campaign", brand: null },
  { src: olv3, alt: "Willie Victory - Editorial", brand: null },
];

const ModelVictory = forwardRef<HTMLDivElement>((_, ref) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div ref={ref}>
      <Helmet>
        <title>Willie Victory | Spotlight Models</title>
        <meta
          name="description"
          content="Model profile for Willie Victory - Height: 5ft11, Hair: Black, Eyes: Brown. Scouted and developed by Spotlight."
        />
        <meta property="og:title" content="Willie Victory | Spotlight Models" />
        <meta property="og:description" content="Discover Willie Victory, a rising star scouted and developed by Spotlight." />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="max-w-7xl mx-auto">

          {/* Model Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12 px-6"
          >
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide uppercase">
              Willie Victory
            </h1>
          </motion.div>

          {/* Hero Portrait - First Image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="px-6 mb-12"
          >
            <div className="max-w-md mx-auto">
              <div 
                className="relative aspect-[3/4] overflow-hidden rounded-[2rem] shadow-2xl cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={galleryImages[0].src}
                  alt={galleryImages[0].alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            </div>
          </motion.div>

          {/* Horizontal Scrolling Gallery - Remaining Images */}
          <div className="mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center mb-6"
            >
              Willie Victory
            </motion.p>
            
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x md:snap-none md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 pb-4 scrollbar-hide">
              {galleryImages.slice(1).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="snap-center flex-shrink-0 md:flex-shrink w-[calc(85vw-40px)] md:w-full max-w-[420px] md:max-w-none"
                >
                  <div 
                    className="relative aspect-[3/4] overflow-hidden rounded-2xl group cursor-pointer"
                    onClick={() => openLightbox(index + 1)}
                  >
                    <img loading="lazy" decoding="async"
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {image.brand && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                        <span className="text-white text-[10px] uppercase tracking-[0.15em] font-medium">
                          {image.brand}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Indicator - Mobile Only */}
            {galleryImages.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex justify-center mt-4 gap-2 md:hidden"
              >
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Swipe to explore
                </span>
                <span className="text-muted-foreground">→</span>
              </motion.div>
            )}
          </div>

          {/* Model Info */}
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/30"
            >
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6 text-center">
                Willie Victory
              </h2>

              {/* Bio Section */}
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed text-center font-light leading-relaxed">
                  Scouted and developed by Spotlight, Willie Victory is a rising talent known for her strong presence, high-fashion versatility, and compelling editorial expression. Featuring a striking profile and exceptional composure, she is built for both commercial campaigns and editorial runway stories.
                </p>
              </div>

              <div className="space-y-4 text-center">
                <div className="flex justify-center gap-8 flex-wrap text-muted-foreground">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground/60">Height</span>
                    <p className="text-foreground mt-1">5ft11</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground/60">Hair</span>
                    <p className="text-foreground mt-1">Black</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground/60">Eyes</span>
                    <p className="text-foreground mt-1">Brown</p>
                  </div>
                </div>

                {/* Links Section */}
                <div className="pt-6 border-t border-border/30 space-y-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground block">
                    Scouted & Developed by Spotlight Management
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      <ImageLightbox
        images={galleryImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((prev) => Math.min(prev + 1, galleryImages.length - 1))}
        onPrevious={() => setLightboxIndex((prev) => Math.max(prev - 1, 0))}
      />
    </div>
  );
});

ModelVictory.displayName = "ModelVictory";

export default ModelVictory;
