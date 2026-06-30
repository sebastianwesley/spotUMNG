import { useState, useEffect, forwardRef } from "react";
import { Menu, X, Search, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Our Services", href: "/services" },
  { name: "All Models", href: "/models" },
  { name: "Placements", href: "/placements" },
  { name: "Model Development", href: "/development" },
  { name: "Apply to Be a Model", href: "/apply" },
  { name: "Book Us", href: "/book" },
  { name: "Productions", href: "/productions" },
  { name: "News & Updates", href: "/news" },
  { name: "Contact", href: "/contact" },
];

const Navbar = forwardRef<HTMLDivElement>((_, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div ref={ref}>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled && !isOpen
            ? "bg-background/95 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 lg:px-[60px]">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left Side - Back Button & Logo */}
            <div className="flex items-center gap-3">
              {/* Back Button - Only show if not on home page */}
              {!isHomePage && (
                <button
                  onClick={handleGoBack}
                  className={`p-2 transition-colors duration-300 hover:opacity-70 z-50 ${
                    isOpen
                      ? "text-background"
                      : (isScrolled || !isHomePage) ? "text-foreground" : "text-background"
                  }`}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              {/* Logo */}
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="group flex items-center z-50"
              >
                <span className={`text-xl lg:text-2xl font-bold tracking-tight transition-all duration-300 group-hover:opacity-80 ${
                  isOpen
                    ? "text-background"
                    : (isScrolled || !isHomePage) ? "text-foreground" : "text-background"
                }`}>
                  spotlightU
                </span>
              </Link>
            </div>

            {/* Right Side - Search & Menu */}
            <div className="flex items-center gap-4">
              {/* Search Icon */}
              <button
                className={`p-2 transition-colors duration-300 z-50 ${
                  isOpen
                    ? "text-background"
                    : (isScrolled || !isHomePage) ? "text-foreground" : "text-background"
                }`}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Burger Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 transition-all duration-300 z-50 hover:scale-105 active:scale-95 cursor-pointer ${
                  isOpen
                    ? "text-background"
                    : (isScrolled || !isHomePage) ? "text-foreground" : "text-background"
                }`}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={26} className="animate-scale-in" /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div
        onClick={(e) => {
          // Close menu if user clicks anywhere outside the links (on the empty backdrop overlay)
          if (e.target === e.currentTarget) {
            setIsOpen(false);
          }
        }}
        className={`fixed inset-0 z-40 bg-foreground transition-all duration-500 cursor-default ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Menu Content */}
        <div className="h-full flex items-center justify-center px-5 overflow-y-auto">
          <nav className="text-center py-20">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-3 md:py-4 text-lg md:text-2xl lg:text-3xl font-light transition-all duration-300 tracking-wide ${
                  location.pathname === link.href 
                    ? "text-background font-medium" 
                    : "text-background/60 hover:text-background"
                } ${isOpen ? 'animate-fade-in-up' : ''}`}
                style={{ 
                  animationDelay: `${index * 0.04}s`,
                  animationFillMode: 'both'
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Info in Menu */}
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none select-none">
          <p className="text-background/30 text-xs tracking-widest uppercase">
            © 2026 SpotlightU. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;
