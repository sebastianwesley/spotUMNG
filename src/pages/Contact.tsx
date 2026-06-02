import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import LogoWatermark from "@/components/LogoWatermark";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | SpotlightU</title>
        <meta
          name="description"
          content="Get in touch with SpotlightU. Whether you're a brand, model, or creative seeking collaboration."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Contact;
