import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LogoWatermark from "@/components/LogoWatermark";

const News = () => {
  return (
    <>
      <Helmet>
        <title>News & Updates | SpotlightU</title>
        <meta
          name="description"
          content="Stay updated with the latest news and announcements from SpotlightU."
        />
      </Helmet>

      <div className="min-h-screen bg-background relative">
        <LogoWatermark />
        <Navbar />
        <main className="pt-20">
          <section className="py-24 lg:py-32 bg-background">
            <div className="max-w-[1200px] mx-auto px-5 lg:px-[60px]">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-[0.1em] uppercase text-foreground mb-6">
                  News & Updates
                </h1>
                <p className="text-base lg:text-lg text-muted-foreground max-w-[600px] mx-auto mb-16 font-light">
                  Stay tuned for the latest from SpotlightU
                </p>

                <div className="relative py-20">
                  <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                  <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-sans font-bold text-foreground mb-4 tracking-tight">
                    Coming Soon
                  </h2>
                  <p className="relative text-lg text-muted-foreground font-light">
                    We're preparing exciting updates and news for you.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default News;
