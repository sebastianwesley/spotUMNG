import { useState } from "react";
import { motion } from "framer-motion";
import abt1 from "@/assets/abt1.jpg";
import abt4 from "@/assets/abt4.jpg";
import abt5 from "@/assets/abt5.jpg";
import pillar1 from "@/assets/pillar1.jpg";

const AboutFull = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const galleryImages = [
    { src: abt1, alt: "Spotlight Gallery 1" },
    { src: abt4, alt: "Spotlight Gallery 2" },
    { src: abt5, alt: "Spotlight Gallery 3" },
    { src: pillar1, alt: "Spotlight Pillar 1" },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 opacity-30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-primary/5 opacity-30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px]">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-24"
        >
          <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-muted-foreground font-light block mb-3">
            Who We Are
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-7xl text-foreground tracking-wide uppercase">
            Spotlight
          </h1>
          <p className="font-sans text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground mt-2">
            Scouting · Development · Management · Production
          </p>
        </motion.div>

        {/* Text Sections - Clean Stack */}
        <div className="max-w-3xl mx-auto space-y-16 lg:space-y-24 mb-24 lg:mb-32">
          {/* Section 1: About Spotlight Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-6 uppercase tracking-wide text-center">
              About Spotlight Management
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-sans font-light text-center">
              Founded in 2020 by Sebastian Wesley, Spotlight Management is a solution-driven management built on ethics and innovation. Evolving from a local production house in Omoku, Rivers State, into a strategic talent network, the management provides more than mere representation. By leveraging over five years of industry experience, Spotlight delivers human-centric development and structured environments where models and fashion creatives transform their mindsets and thrive.
            </p>
          </motion.div>

          {/* Section 2: Our Impact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-6 uppercase tracking-wide text-center">
              Our Impact
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-sans font-light text-center">
              Spotlight’s impact is rooted in execution, problem-solving, and professional safety. The management operates a disciplined ecosystem, spanning scouting, development, production, and management, specifically engineered to deliver tangible career solutions. Protecting and supporting talent is the absolute priority from day one.
            </p>
          </motion.div>

          {/* Section 3: Our Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground mb-6 uppercase tracking-wide text-center">
              Our Vision
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-sans font-light text-center">
              Spotlight serves as a dynamic ecosystem for models, photographers, and designers. By deploying unconventional strategies and leveraging a vast professional network, the management actively builds the bridge to the future of the fashion industry.
            </p>
          </motion.div>
        </div>

        {/* Gallery Preview Section - Positioned below the mission/vision statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="border-t border-border/40 pt-16 lg:pt-24"
        >
          <div className="text-center mb-12">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-light">
              Our Foundation
            </span>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground uppercase tracking-wide mt-2">
              Spotlight Core Pillars
            </h3>
          </div>

          <div className="flex md:justify-center overflow-x-auto md:overflow-x-visible snap-x md:snap-none scrollbar-hide gap-6 px-6 pb-10">
            {galleryImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="snap-center flex-shrink-0 w-[calc(70vw-20px)] md:w-[200px] max-w-[280px]"
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary shadow-medium group cursor-pointer">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hoveredIndex === index ? "scale-105" : "scale-100 grayscale"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Scroll Indicator - Mobile Only */}
          <div className="flex justify-center mt-4 gap-2 md:hidden">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Swipe to explore
            </span>
            <span className="text-muted-foreground">→</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutFull;