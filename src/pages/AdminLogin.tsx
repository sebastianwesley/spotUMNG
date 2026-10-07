import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getAdminSession, signInAdmin } from "@/lib/applicationService";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAdminSession().then(({ session }) => {
      if (session) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signInAdmin(email, password);

    if (result.error) {
      setError(result.error.message);
      setIsSubmitting(false);
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Admin Sign In | SpotlightU</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center px-5 py-20">
        <div className="w-full max-w-[420px]">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            SpotlightU Admin
          </p>
          <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-[0.1em] uppercase text-foreground mb-12">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                placeholder="admin@spotlightu.com"
              />
            </div>

            <div>
              <label className="block text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-xs tracking-[0.1em] text-destructive font-light">{error}</p>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex w-full items-center justify-center gap-3 px-10 py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase font-sans font-medium overflow-hidden transition-all duration-500 hover:bg-foreground/90 disabled:opacity-50"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Signing In" : "Sign In"}
                </span>
                <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                <span className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;