import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PortfolioShowcase from "@/components/PortfolioShowcase";
import LogoWatermark from "@/components/LogoWatermark";

const Models = () => {
  return (
    <>
      <Helmet>
        <title>All Models | SpotlightU</title>
        <meta
          name="description"
          content="Browse our diverse portfolio of professional models from around the world."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <PortfolioShowcase />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Models;
