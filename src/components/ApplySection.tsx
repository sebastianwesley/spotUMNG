import { useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, X } from "lucide-react";
import { toast } from "sonner";

type PhotoType = 'headshot' | 'fullbody' | 'profile';

interface PhotoUpload {
  file: File;
  preview: string;
}

const ApplySection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [photos, setPhotos] = useState<Record<PhotoType, PhotoUpload | null>>({
    headshot: null,
    fullbody: null,
    profile: null,
  });
  const [additionalPhotos, setAdditionalPhotos] = useState<PhotoUpload[]>([]);
  const [consentChecked, setConsentChecked] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  const headshotRef = useRef<HTMLInputElement>(null);
  const fullbodyRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const additionalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate dynamic redirect URL back to the apply page
    setRedirectUrl(window.location.origin + "/apply?success=true");

    // Check if coming back from a successful email submission
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("success") === "true") {
      toast.success("Your model application has been submitted successfully!");
      // Clean up the URL query parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }

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

  const handlePhotoUpload = (type: PhotoType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke old preview URL if exists
    if (photos[type]) {
      URL.revokeObjectURL(photos[type]!.preview);
    }

    setPhotos((prev) => ({
      ...prev,
      [type]: {
        file,
        preview: URL.createObjectURL(file),
      },
    }));
  };

  const removePhoto = (type: PhotoType) => {
    if (photos[type]) {
      URL.revokeObjectURL(photos[type]!.preview);
      setPhotos((prev) => ({
        ...prev,
        [type]: null,
      }));
    }
  };

  const handleAdditionalPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setAdditionalPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removeAdditionalPhoto = (index: number) => {
    setAdditionalPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const PhotoUploadBox = ({
    type,
    label,
    subLabel,
    inputRef,
    photo,
  }: {
    type: PhotoType;
    label: string;
    subLabel: string;
    inputRef: React.RefObject<HTMLInputElement>;
    photo: PhotoUpload | null;
  }) => (
    <div className="space-y-2">
      <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground">
        {label} <span className="text-destructive">*</span>
      </label>
      <p className="text-xs text-muted-foreground/70 font-light">{subLabel}</p>
      
      {/* File input must have the 'name' attribute for standard HTML form submission to attach files */}
      <input
        ref={inputRef}
        type="file"
        name={type}
        accept="image/*"
        onChange={(e) => handlePhotoUpload(type, e)}
        className="hidden"
      />

      {photo ? (
        <div className="relative aspect-[3/4] w-full max-w-[200px] group">
          <img
            src={photo.preview}
            alt={label}
            className="w-full h-full object-cover border border-border"
          />
          <button
            type="button"
            onClick={() => removePhoto(type)}
            className="absolute top-2 right-2 w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="aspect-[3/4] w-full max-w-[200px] border-2 border-dashed border-muted-foreground/30 hover:border-foreground/50 transition-colors duration-300 cursor-pointer flex flex-col items-center justify-center group bg-muted/20"
        >
          <Camera className="w-8 h-8 text-muted-foreground/50 group-hover:text-foreground/70 transition-colors duration-300 mb-3" />
          <p className="text-xs text-muted-foreground/70 group-hover:text-foreground/80 transition-colors duration-300 text-center px-2 font-light">
            Click to upload {label.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="apply"
      className="py-24 lg:py-32 bg-background"
    >
      <div className="max-w-[1400px] mx-auto px-5 lg:px-[60px]">
        {/* Header */}
        <div className={`mb-16 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h2 className="text-center text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-[0.1em] uppercase text-foreground mb-6">
            Become a Model
          </h2>
          <p className="text-center text-sm md:text-base tracking-[0.1em] uppercase text-muted-foreground max-w-[600px] mx-auto font-sans font-light">
            We're always looking for unique and emerging talent
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left - Requirements */}
          <div className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-8 pb-4 border-b border-border font-sans font-semibold">
              Requirements
            </h3>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm tracking-[0.15em] uppercase text-foreground mb-3 font-sans font-bold">Age</h4>
                <p className="text-muted-foreground font-light leading-relaxed">
                  Must be 16 years or older. Parental consent required for applicants under 18.
                </p>
              </div>

              <div>
                <h4 className="text-sm tracking-[0.15em] uppercase text-foreground mb-3 font-sans font-bold">Photos</h4>
                <p className="text-muted-foreground font-sans font-light leading-relaxed">
                  Submit 3-5 recent, unedited photos including headshot, full body, and profile views. Natural lighting preferred.
                </p>
              </div>

              <div>
                <h4 className="text-sm tracking-[0.15em] uppercase text-foreground mb-3 font-sans font-bold">Experience</h4>
                <p className="text-muted-foreground font-sans font-light leading-relaxed">
                  No prior experience necessary — we develop raw talent. Open to all genders, ethnicities, and body types.
                </p>
              </div>

              <div>
                <h4 className="text-sm tracking-[0.15em] uppercase text-foreground mb-3 font-sans font-bold">Response Time</h4>
                <p className="text-muted-foreground font-sans font-light leading-relaxed">
                  We review all submissions within 5-7 business days. Selected candidates will be contacted for an interview.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Application Form */}
          <div className={`${isVisible ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-8 pb-4 border-b border-border font-sans font-semibold">
              Application Form
            </h3>

            {/* Standard HTML Form submission to FormSubmit (bypasses CORS + handles image uploads natively) */}
            <form 
              action="https://formsubmit.co/spotlightmng@outlook.com" 
              method="POST" 
              enctype="multipart/form-data" 
              className="space-y-6"
            >
              {/* FormSubmit Config Inputs */}
              <input type="hidden" name="_next" value={redirectUrl} />
              <input type="hidden" name="_captcha" value="false" />

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    First Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="FirstName"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Last Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="LastName"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  name="Email"
                  required
                  className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Age <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    name="Age"
                    required
                    min="16"
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                    placeholder="21"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Height <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="Height"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                    placeholder="5'9&quot;"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Location <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="Location"
                    required
                    className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                    placeholder="Lagos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  name="Instagram"
                  className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                  placeholder="@username"
                />
              </div>

              {/* Photos Section */}
              <div className="pt-4">
                <h4 className="text-sm tracking-[0.15em] uppercase text-foreground mb-2 font-sans font-bold flex items-center gap-2">
                  <span>📸</span> Photos
                </h4>
                <p className="text-xs text-muted-foreground/70 font-light mb-6">
                  Please upload your photos. Required: headshot, full-body shot, and profile shot.
                </p>

                {/* Required Photos Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <PhotoUploadBox
                    type="headshot"
                    label="Headshot"
                    subLabel="Front-facing portrait photo"
                    inputRef={headshotRef}
                    photo={photos.headshot}
                  />
                  <PhotoUploadBox
                    type="fullbody"
                    label="Full Body"
                    subLabel="Full-length standing photo"
                    inputRef={fullbodyRef}
                    photo={photos.fullbody}
                  />
                  <PhotoUploadBox
                    type="profile"
                    label="Profile"
                    subLabel="Side-view portrait photo"
                    inputRef={profileRef}
                    photo={photos.profile}
                  />
                </div>

                {/* Additional Photos */}
                <div className="space-y-2">
                  <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground">
                    Additional Photos (Optional)
                  </label>
                  
                  <input
                    ref={additionalRef}
                    type="file"
                    name="AdditionalPhotos"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalPhotos}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => additionalRef.current?.click()}
                      className="px-4 py-2 bg-muted border border-border text-sm text-foreground hover:bg-muted/80 transition-colors duration-300 font-light"
                    >
                      Choose Files
                    </button>
                    <span className="text-xs text-muted-foreground/70 font-light">
                      {additionalPhotos.length > 0
                        ? `${additionalPhotos.length} file${additionalPhotos.length > 1 ? 's' : ''} selected`
                        : 'No file chosen'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/50 font-light">
                    You can select multiple files (JPG, PNG, WEBP)
                  </p>

                  {/* Additional Photos Preview */}
                  {additionalPhotos.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                      {additionalPhotos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={photo.preview}
                            alt={`Additional ${index + 1}`}
                            className="w-full h-full object-cover border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalPhoto(index)}
                            className="absolute top-1 right-1 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  Tell Us About Yourself
                </label>
                <textarea
                  name="About"
                  rows={4}
                  className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 resize-none font-light"
                  placeholder="Share your experience and aspirations..."
                />
              </div>

              {/* Legal / Consent Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  name="ConsentAgreement"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  required
                  className="mt-1 w-4 h-4 accent-foreground cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs text-muted-foreground font-light leading-relaxed cursor-pointer">
                  I agree to the terms and conditions and consent to the processing of my personal data for Spotlight Model Management.{" "}
                  <span className="text-destructive">*</span>
                </label>
              </div>

              <div className="pt-8">
                <button
                  type="submit"
                  className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase font-sans font-medium overflow-hidden transition-all duration-500 hover:bg-foreground/90"
                >
                  <span className="relative z-10">Submit Application</span>
                  <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  <span className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
              </div>
            </form>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
                Or email us directly at{" "}
                <a
                  href="mailto:spotlightmng@outlook.com"
                  className="text-foreground hover:text-muted-foreground transition-colors duration-300"
                >
                  spotlightmng@outlook.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplySection;
