import { useEffect, useRef, useState } from "react";
import { MapPin, Mail, Phone, Instagram, Facebook } from "lucide-react";

const ContactSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="py-20 lg:py-28 bg-background relative overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-stretch">
          {/* Contact Info */}
          <div className={`flex flex-col justify-between ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[44px] font-sans font-bold text-foreground mb-6 tracking-tight">
                Let's Connect
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed font-sans font-light">
                Whether you're a brand looking for talent, a model ready to take the next step, or a creative seeking collaboration — we'd love to hear from you.
              </p>

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-foreground mb-1">Location</h4>
                    <p className="text-muted-foreground font-sans font-light">
                      Omoku, Rivers State<br />
                      Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-foreground mb-1">Email</h4>
                    <a
                      href="mailto:spotlightmng@outlook.com"
                      className="text-muted-foreground hover:text-accent transition-colors duration-300 font-sans font-light"
                    >
                      spotlightmng@outlook.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-foreground mb-1">Phone</h4>
                    <a
                      href="tel:+2348051586944"
                      className="text-muted-foreground hover:text-accent transition-colors duration-300 font-sans font-light"
                    >
                      +234 805 158 6944
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-sans font-bold text-foreground mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/spotlight_mng?igsh=MWVmcWQxOXZkZnk3aQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://www.facebook.com/share/1DZbsAgnPY/?mibextid=qi2Omg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Direct CTA Button Card */}
          <div className={isVisible ? "animate-slide-in-right" : "opacity-0"}>
            <div className="bg-secondary p-8 lg:p-12 rounded-2xl h-full flex flex-col justify-center items-center text-center border border-border/40 relative overflow-hidden">
              {/* Premium background soft glow effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <h3 className="text-2xl md:text-3xl font-sans font-bold text-foreground mb-4 tracking-tight relative z-10">
                Ready to Work Together?
              </h3>
              <p className="text-base text-muted-foreground mb-8 max-w-[400px] font-sans font-light leading-relaxed relative z-10">
                Skip the forms. Click the button below to open your default email application and send a message directly to our team. We will reply to all enquiries.
              </p>

              <a
                href="mailto:spotlightmng@outlook.com?subject=Inquiry%20to%20Spotlight%20Management"
                className="w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-4 bg-foreground text-background text-sm tracking-[0.2em] uppercase font-sans font-medium hover:bg-foreground/90 transition-all duration-300 shadow-md group relative z-10"
              >
                <span>Email Us Directly</span>
                <Mail size={16} className="transition-transform duration-300 group-hover:scale-110" />
              </a>

              <p className="text-xs text-muted-foreground/60 mt-6 font-sans font-light relative z-10">
                Or manually copy our address: <span className="font-medium text-foreground">spotlightmng@outlook.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
