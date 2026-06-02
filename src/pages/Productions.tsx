import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductionsPreview from "@/components/ProductionsPreview";
import LogoWatermark from "@/components/LogoWatermark";

const Productions = () => {
  return (
    <>
      <Helmet>
        <title>Productions | SpotlightU</title>
        <meta
          name="description"
          content="Explore fashion productions and creative campaigns from SpotlightU."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <ProductionsPreview />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Productions;
