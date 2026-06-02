import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CastingSection from "@/components/CastingSection";
import LogoWatermark from "@/components/LogoWatermark";

const Book = () => {
  return (
    <>
      <Helmet>
        <title>Book Us | SpotlightU</title>
        <meta
          name="description"
          content="Book professional casting services with SpotlightU. We partner with directors, brands, and creative teams."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <CastingSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Book;
