import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutFull from "@/components/AboutFull";
import LogoWatermark from "@/components/LogoWatermark";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Spotlight Management</title>
        <meta
          name="description"
          content="Learn about Spotlight Management - a solution-driven company built on ethics and innovation, founded by Sebastian Wesley in 2020."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <AboutFull />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default About;
