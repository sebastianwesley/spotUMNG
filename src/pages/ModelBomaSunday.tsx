import { forwardRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageLightbox from "@/components/ImageLightbox";
import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";
import bomaImage from "@/assets/boma-sunday.jpg";
import bomaEditorial1 from "@/assets/boma-sunday-editorial-1.jpg";
import bomaBackstage from "@/assets/boma-sunday-backstage.jpg";
import bomaEditorial2 from "@/assets/boma-sunday-editorial-2.jpg";
import bomaSnow from "@/assets/boma-sunday-snow.jpg";
import bomaDuo from "@/assets/boma-sunday-duo.jpg";
import bomaArmani from "@/assets/boma-sunday-armani.jpg";
import bomaCeline from "@/assets/boma-sunday-celine.jpg";

const galleryImages = [
  { src: bomaImage, alt: "Boma Sunday - Portrait", brand: null },
  { src: bomaEditorial1, alt: "Boma Sunday - Self Service", brand: null },
  { src: bomaSnow, alt: "Boma Sunday - T Magazine Radically Simple", brand: "T: The New York Times Style Magazine – Radically Simple" },
  { src: bomaArmani, alt: "Boma Sunday - Beyond Noise", brand: "Photography Robin Galiegue\nBeyond Noise (Editorial)\n10/24/2025\nphotographer: Robin Galiegue" },
  { src: bomaEditorial2, alt: "Boma Sunday - Self Service", brand: "Self Service\nThe Obsessions by Mark Kean\nSource: selfservicemagazine.com\nPublished: 10/07/2025" },
  { src: bomaDuo, alt: "Boma Sunday - T Magazine Radically Simple", brand: "T: The New York Times Style Magazine – Radically Simple" },
  { src: bomaBackstage, alt: "Boma Sunday - Backstage", brand: null },
];

const ModelBomaSunday = forwardRef<HTMLDivElement>((_, ref) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div ref={ref}>
      <Helmet>
        <title>Boma Sunday | Spotlight Models</title>
        <meta
          name="description"
          content="Model profile for Boma Sunday - Height: 5ft9.5, Hair: Black, Eyes: Brown. Placed with Ekwere Models."
        />
        <meta property="og:title" content="Boma Sunday | Spotlight Models" />
        <meta property="og:description" content="Model profile for Boma Sunday - Height: 5ft9.5, Hair: Black, Eyes: Brown. Placed with Ekwere Models." />
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
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-wide uppercase">
              Boma Sunday
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
              Campaign & Editorial Work
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
                        <span className="text-white text-[10px] tracking-[0.15em] font-medium whitespace-pre-line">
                          {image.brand}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Indicator - Mobile Only */}
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
              Boma Sunday
            </h2>

            {/* Bio Section */}
            <div className="mb-8">
              <p className="text-muted-foreground leading-relaxed text-center">
                Scouted by Spotlight and placed with Ekwere Models in Nigeria, her mother agency officially placed her with international agencies including Elite Model Management in Paris, Milan, and London, as Boma has become a face for Celine, walking multiple shows and starring in the Celine Printemps 2026 advertising campaign. Her editorial work includes features in T: The New York Times Style Magazine, Self Service, and Beyond Noise.
              </p>
            </div>

            <div className="space-y-4 text-center">
              <div className="flex justify-center gap-8 flex-wrap text-muted-foreground">
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground/60">Height</span>
                  <p className="text-foreground mt-1">5ft9.5</p>
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
                <a
                  href="https://www.instagram.com/bomasunday_?igsh=MXdlbm4wemZmOHNieg=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest">@bomasunday_</span>
                  <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>

                <div className="flex flex-col items-center gap-3">
                  <a
                    href="https://www.instagram.com/ekwere_models?igsh=MXFuamx2YXBocTk4bw=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span className="text-xs uppercase tracking-widest">Agency: Ekwere Models</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <a
                    href="https://models.com/models/boma-sunday"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span className="text-xs uppercase tracking-widest">Models.com</span>
                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
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

ModelBomaSunday.displayName = "ModelBomaSunday";

export default ModelBomaSunday;
