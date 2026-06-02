import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModelDevelopment from "@/components/ModelDevelopment";
import LogoWatermark from "@/components/LogoWatermark";

const Development = () => {
  return (
    <>
      <Helmet>
        <title>Model Development | SpotlightU</title>
        <meta
          name="description"
          content="Transform your passion into professionalism with SpotlightU's model development program."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <ModelDevelopment />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Development;
