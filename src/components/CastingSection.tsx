import { useEffect, useRef, useState } from "react";
import { Phone, Mail, Calendar, Briefcase, ArrowRight, MessageSquare, Sparkles, Copy, Check, RotateCcw, Send } from "lucide-react";

const CastingSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    projectType: "Editorial Fashion",
    details: "",
    date: ""
  });
  const [copied, setCopied] = useState(false);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getWhatsAppLinkText = () => {
    const nameStr = formData.name.trim() || 'Not specified';
    const companyStr = formData.company.trim() || 'Not specified';
    const dateStr = formData.date.trim() || 'Not specified';
    const detailsStr = formData.details.trim() || 'Not specified';

    return `Hello Spotlight Team,\n\nI would like to book a casting session with the following details:\n\n👤 Name: ${nameStr}\n🏢 Company: ${companyStr}\n💼 Project: ${formData.projectType}\n📅 Date: ${dateStr}\n📝 Details: ${detailsStr}`;
  };

  const getWhatsAppLink = () => {
    return `https://wa.me/2348051586944?text=${encodeURIComponent(getWhatsAppLinkText())}`;
  };

  const getEmailLink = () => {
    const subject = encodeURIComponent(`Casting Booking Session - ${formData.company.trim() || formData.name.trim() || 'Inquiry'}`);
    return `mailto:spotlightmng@outlook.com?subject=${subject}&body=${encodeURIComponent(getWhatsAppLinkText())}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getWhatsAppLinkText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy message: ", err);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      company: "",
      projectType: "Editorial Fashion",
      details: "",
      date: ""
    });
  };

  const dispatchWhatsApp = () => {
    window.open(getWhatsAppLink(), "_blank", "noopener,noreferrer");
  };

  const dispatchEmail = () => {
    window.location.href = getEmailLink();
  };

  return (
    <section
      ref={sectionRef}
      id="book"
      className="py-20 lg:py-32 bg-secondary relative overflow-hidden"
    >
      {/* Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[15vw] font-bold text-foreground/[0.02] uppercase tracking-widest">
          CASTING
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px] relative z-10">
        {/* Section Header */}
        <div className={`text-center max-w-[800px] mx-auto mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/[0.03] border border-foreground/[0.08] text-xs uppercase tracking-widest text-muted-foreground mb-4">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Spotlight Booking Hub
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-[48px] font-sans font-bold text-foreground mb-6 leading-tight tracking-tight">
            Book a Casting Session
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed font-sans font-light">
            We partner with directors, brands, and creative teams to deliver tailored casting solutions across print, digital, runway, and film. Our diverse, world-class talent pool is curated quickly without compromising quality.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Column 1: Interactive Inquiry Builder */}
          <div 
            className={`lg:col-span-7 bg-background rounded-3xl p-6 lg:p-10 border border-border shadow-soft transition-all duration-500 hover:shadow-medium ${
              isVisible ? "animate-fade-in-up-delay-1" : "opacity-0"
            }`}
          >
            <h3 className="text-xl lg:text-2xl font-sans font-bold text-foreground mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" />
              Inquiry Builder
            </h3>
            <p className="text-sm text-muted-foreground mb-8 font-light">
              Fill in your casting requirements. This will dynamically compose your booking message below!
            </p>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Jane Doe"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="company" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Company / Brand</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., Vogue, Zara"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="projectType" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Project Type</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  >
                    <option value="Editorial Fashion">Editorial Fashion</option>
                    <option value="Commercial Campaign">Commercial Campaign</option>
                    <option value="Runway Show">Runway Show</option>
                    <option value="Film & TV Production">Film & TV Production</option>
                    <option value="Other Casting Session">Other Casting Session</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="date" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Timeline / Target Date</label>
                  <input
                    type="text"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    placeholder="e.g., Mid-June 2026"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="details" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Casting Requirements / Vision</label>
                <textarea
                  id="details"
                  name="details"
                  rows={4}
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Describe your vision, type of models needed, specific styles, sizes, or ethnicities..."
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all resize-none font-sans"
                />
              </div>

              {/* Live Automated Message Preview */}
              <div className="space-y-2 mt-6">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">Automated Message Preview</label>
                <div className="relative rounded-2xl bg-secondary/80 border border-border p-4 font-mono text-xs text-foreground/80 leading-relaxed overflow-x-auto max-h-[220px] scrollbar-hide whitespace-pre-wrap select-all transition-all duration-300">
                  {getWhatsAppLinkText()}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-secondary/50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Form
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold py-2 px-4 rounded-xl border border-border bg-background hover:bg-secondary transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-in" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Message
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={dispatchWhatsApp}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-5 rounded-xl transition-all shadow-sm shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Column 2: Direct Premium Action Center */}
          <div 
            className={`lg:col-span-5 space-y-6 ${
              isVisible ? "animate-fade-in-up-delay-2" : "opacity-0"
            }`}
          >
            <div className="bg-background rounded-3xl p-6 lg:p-8 border border-border shadow-soft">
              <h3 className="text-lg lg:text-xl font-sans font-bold text-foreground mb-4">
                Select Your Contact Method
              </h3>
              <p className="text-xs text-muted-foreground mb-6 font-light leading-relaxed">
                Clicking either option will open your native application pre-filled with the details you entered in the builder.
              </p>

              <div className="space-y-4">
                {/* WhatsApp Action Card */}
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-start gap-4 p-5 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1 block cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
                      Direct WhatsApp Booking
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </span>
                    <h4 className="font-sans font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                      +234 8051586944
                    </h4>
                    <p className="text-xs text-muted-foreground font-light leading-normal">
                      Click to initiate a chat. Highly recommended for instant response.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground absolute top-5 right-5 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all" />
                </a>

                {/* Email Action Card */}
                <a
                  href={getEmailLink()}
                  className="group relative flex items-start gap-4 p-5 rounded-2xl bg-accent/[0.03] border border-accent/10 hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 block cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider font-bold text-accent">
                      Official Email Inquiry
                    </span>
                    <h4 className="font-sans font-bold text-foreground group-hover:text-accent transition-colors break-all">
                      spotlightmng@outlook.com
                    </h4>
                    <p className="text-xs text-muted-foreground font-light leading-normal">
                      Click to write an email. Best for detailed briefs and official RFPs.
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground absolute top-5 right-5 group-hover:translate-x-1 group-hover:text-accent transition-all" />
                </a>
              </div>
            </div>

            {/* Visual Quote / Trajectory Statement */}
            <div className="bg-foreground rounded-3xl p-6 lg:p-8 text-background relative overflow-hidden shadow-medium">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-background/[0.03] rounded-full border border-background/[0.05]" />
              <blockquote className="text-base font-sans italic mb-4 relative z-10 leading-relaxed font-light">
                "We don't just match faces with projects. We align the right energy with your brand's narrative."
              </blockquote>
              <div className="text-xs uppercase tracking-widest text-background/60 font-sans font-bold">
                — SpotlightU Casting Team
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default CastingSection;
