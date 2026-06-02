import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, X } from 'lucide-react';
import discoveryImage from '@/assets/discovery-to-placement.jpg';
import successImage from '@/assets/success-nwokocha.jpg';
import bomaImage from '@/assets/boma-sunday.jpg';

const placedModels = [
  {
    name: "Success Nwokocha",
    image: successImage,
    instagram: "@success_nwokocha",
    agency: "Select Model Management",
    modelsComUrl: "https://models.com/models/nwokocha-success",
    profileUrl: "/placements/success-nwokocha"
  },
  {
    name: "Boma Sunday",
    image: bomaImage,
    instagram: "@bomasunday_",
    agency: "Elite Model Management",
    modelsComUrl: "https://models.com/models/boma-sunday",
    profileUrl: "/placements/boma-sunday"
  }
];

export default function HorizontalPlacementGallery() {
  const [showPlacements, setShowPlacements] = useState(false);

  return (
    <section className="w-full bg-background py-16 md:py-24">
      <AnimatePresence mode="wait">
        {!showPlacements ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center px-6"
          >
            <div className="w-full max-w-md aspect-[3/4] rounded-[2rem] overflow-hidden mb-10 shadow-lg">
              <img 
                src={discoveryImage} 
                alt="Spotlight Model Development" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-center text-muted-foreground max-w-xs text-sm leading-relaxed mb-8">
              Our structured pipeline transforms raw potential into industry-ready talent, with placements at top international agencies.
            </p>
            <button 
              onClick={() => setShowPlacements(true)}
              className="px-10 py-4 border border-border rounded-full text-[10px] uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Explore Faces
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-6 mb-8 flex justify-between items-end max-w-7xl mx-auto">
              <h2 className="font-serif text-2xl md:text-3xl tracking-tight text-foreground">Placed Talent</h2>
              <button 
                onClick={() => setShowPlacements(false)} 
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="flex md:justify-center overflow-x-auto md:overflow-x-visible snap-x md:snap-none scrollbar-hide gap-6 px-6 pb-10">
              {placedModels.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="min-w-[85%] md:min-w-0 md:w-[400px] snap-center flex-shrink-0"
                >
                  <Link to={model.profileUrl}>
                    <div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 bg-muted group">
                      <img 
                        src={model.image} 
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                    </div>
                  </Link>
                  
                  <div className="flex justify-between items-start px-2">
                    <div>
                      <Link to={model.profileUrl}>
                        <h3 className="text-lg font-medium tracking-tight text-foreground hover:text-primary transition-colors">
                          {model.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground">{model.instagram}</p>
                      <p className="text-[10px] mt-1 text-muted-foreground/70 uppercase tracking-wide">
                        {model.agency}
                      </p>
                    </div>
                    
                    <a 
                      href={model.modelsComUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-foreground text-background px-3 py-1.5 text-[9px] font-bold uppercase tracking-tight rounded-sm hover:bg-primary transition-colors"
                    >
                      models.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}