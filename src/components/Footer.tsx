import { forwardRef } from "react";
import { Instagram, Facebook, Mail, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ],
};

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={ref} className="bg-foreground text-background">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-[60px]">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-bold tracking-tight">
                  SPOTLIGHTU
                </span>
              </Link>
              <p className="text-background/70 max-w-[300px] mb-6 leading-relaxed">
                Redefining how fashion talent is found, developed, and presented to the world.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/spotlight_mng?igsh=MWVmcWQxOXZkZnk3aQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/share/1DZbsAgnPY/?mibextid=qi2Omg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="mailto:spotlightmng@outlook.com"
                  className="w-10 h-10 rounded-full border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-all duration-300"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-sm mb-5">
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-background/70 hover:text-background transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/60">
            © {new Date().getFullYear()} SpotlightU
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="p-2 border border-background/30 rounded-full hover:bg-background hover:text-foreground transition-all duration-300"
              aria-label="Scroll to top"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
