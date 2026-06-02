import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutPreview from "@/components/AboutPreview";
import FeaturedModelsGallery from "@/components/FeaturedModelsGallery";
import DiscoveryToPlacement from "@/components/DiscoveryToPlacement";
import SpotlightUpdates from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import LogoWatermark from "@/components/LogoWatermark";
const Index = () => {
  return (
    <>
      <Helmet>
        <title>SpotlightU | Premier Model Development & Casting Agency</title>
        <meta
          name="description"
          content="SpotlightU is redefining fashion talent discovery. Apply to become a model, explore our portfolio, or book elite casting services for your next campaign."
        />
        <meta
          name="keywords"
          content="modeling agency, model development, fashion casting, talent scouting, model portfolio, fashion production"
        />
        <meta property="og:title" content="SpotlightU | Your Spotlight Begins Here" />
        <meta
          property="og:description"
          content="Apply. Develop. Get Discovered. Build Your Future in Fashion With SpotlightU."
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://spotlightu.com" />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main>
          <HeroSection />
          <AboutPreview />
          <DiscoveryToPlacement />
          <FeaturedModelsGallery />
          <SpotlightUpdates />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
