import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ApplySection from "@/components/ApplySection";
import LogoWatermark from "@/components/LogoWatermark";

const Apply = () => {
  return (
    <>
      <Helmet>
        <title>Apply to Be a Model | SpotlightU</title>
        <meta
          name="description"
          content="Apply to join SpotlightU's roster of professional models. We're always looking for unique and emerging talent."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <ApplySection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Apply;
