import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeaturesSection from "@/components/FeaturesSection";
import CastingSection from "@/components/CastingSection";
import LogoWatermark from "@/components/LogoWatermark";
import HorizontalPlacementGallery from "@/components/HorizontalPlacementGallery";

const Services = () => {
  return (
    <>
      <Helmet>
        <title>Our Services | SpotlightU</title>
        <meta
          name="description"
          content="Explore SpotlightU's services including model development, scouting, production, casting, and e-commerce solutions."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <FeaturesSection />
          <HorizontalPlacementGallery />
          <CastingSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Services;
