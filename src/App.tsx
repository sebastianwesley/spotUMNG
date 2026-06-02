import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Models from "./pages/Models";
import Development from "./pages/Development";
import Apply from "./pages/Apply";
import Book from "./pages/Book";
import Productions from "./pages/Productions";
import News from "./pages/News";
import Contact from "./pages/Contact";
import Placements from "./pages/Placements";
import ModelSuccessNwokocha from "./pages/ModelSuccessNwokocha";
import ModelBomaSunday from "./pages/ModelBomaSunday";
import ModelUsohIfeanyi from "./pages/ModelUsohIfeanyi";
import ModelPaulThompson from "./pages/ModelPaulThompson";
import ModelVictory from "./pages/ModelVictory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/models" element={<Models />} />
            <Route path="/development" element={<Development />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/book" element={<Book />} />
            <Route path="/productions" element={<Productions />} />
            <Route path="/news" element={<News />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/placements" element={<Placements />} />
            <Route path="/placements/success-nwokocha" element={<ModelSuccessNwokocha />} />
            <Route path="/placements/boma-sunday" element={<ModelBomaSunday />} />
            <Route path="/placements/usoh-ifeanyi" element={<ModelUsohIfeanyi />} />
            <Route path="/placements/paul-thompson" element={<ModelPaulThompson />} />
            <Route path="/placements/victory" element={<ModelVictory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
