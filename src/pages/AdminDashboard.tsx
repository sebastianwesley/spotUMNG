import { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import {
  APPLICATION_STATUSES,
  changeAdminPassword,
  getAdminSession,
  listApplications,
  signOutAdmin,
  updateApplicationStatus,
  type Application,
  type ApplicationStatus,
} from "@/lib/applicationService";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

const SIGNED_URL_TTL = 60 * 60;

const statusStyles: Record<ApplicationStatus, string> = {
  new: "border-spotlight-blue/40 text-spotlight-blue",
  reviewing: "border-foreground/30 text-foreground",
  accepted: "border-emerald-600/40 text-emerald-600",
  declined: "border-destructive/40 text-destructive",
};

const StatusBadge = ({ status }: { status: ApplicationStatus }) => (
  <span
    className={`inline-flex items-center border px-2.5 py-0.5 text-[10px] tracking-[0.2em] uppercase font-medium ${statusStyles[status] ?? statusStyles.new}`}
  >
    {status}
  </span>
);

const StatusControl = ({
  id,
  status,
  onChange,
  isSaving,
}: {
  id: string;
  status: ApplicationStatus;
  onChange: (id: string, status: ApplicationStatus) => void;
  isSaving: boolean;
}) => (
  <select
    value={status}
    disabled={isSaving}
    onChange={(e) => onChange(id, e.target.value as ApplicationStatus)}
    className="w-full sm:w-auto bg-transparent border border-border text-foreground text-xs tracking-[0.1em] uppercase py-2 px-3 focus:outline-none focus:border-foreground transition-colors duration-300 disabled:opacity-50"
  >
    {APPLICATION_STATUSES.map((value) => (
      <option key={value} value={value} className="bg-background text-foreground">
        {value}
      </option>
    ))}
  </select>
);

const PhotoStrip = ({ app }: { app: Application }) => {
  const paths = [app.headshot_url, app.fullbody_url, app.profile_url, ...(app.additional_urls ?? [])]
    .filter((path): path is string => Boolean(path));
  const pathsKey = paths.join("|");
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase || !pathsKey) return;
    let active = true;

    Promise.all(
      pathsKey.split("|").filter(Boolean).map(async (path) => {
        // Private bucket: photos are read through short-lived signed URLs.
        const { data } = await supabase.storage.from("applicant-photos").createSignedUrl(path, SIGNED_URL_TTL);
        return data?.signedUrl ?? "";
      })
    ).then((resolved) => {
      if (active) setUrls(resolved.filter(Boolean));
    });

    return () => {
      active = false;
    };
  }, [pathsKey]);

  if (urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {urls.map((url, index) => (
        <a key={index} href={url} target="_blank" rel="noreferrer" className="block">
          <img
            src={url}
            alt={`Applicant photo ${index + 1}`}
            loading="lazy"
            className="w-24 h-32 sm:w-28 sm:h-36 object-cover border border-border hover:opacity-80 transition-opacity duration-300"
          />
        </a>
      ))}
    </div>
  );
};

const ApplicationDetail = ({ app }: { app: Application }) => (
  <div className="space-y-6 text-sm">
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">About</p>
      <p className="text-foreground font-light leading-relaxed whitespace-pre-wrap">
        {app.about || "No additional information provided."}
      </p>
    </div>
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Photos</p>
      <PhotoStrip app={app} />
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    getAdminSession().then(({ session }) => {
      setAdminEmail((session as Session | null)?.user?.email ?? null);
    });
    listApplications().then(({ data, error }) => {
      if (error) setLoadError(`Failed to load applications: ${error.message}`);
      setApplications(data);
      setIsLoading(false);
    });
  }, []);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setSavingId(id);
    setLoadError(null);

    const { error } = await updateApplicationStatus(id, status);

    if (error) {
      setLoadError(error.message);
    } else {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    }

    setSavingId(null);
  };

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate("/admin/login", { replace: true });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: "Passwords do not match.", ok: false });
      return;
    }

    setIsChangingPassword(true);
    const { error } = await changeAdminPassword(newPassword);
    setIsChangingPassword(false);

    if (error) {
      setPasswordMessage({ text: error.message, ok: false });
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage({ text: "Password updated.", ok: true });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | SpotlightU</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-[60px] py-12 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12 pb-6 border-b border-border">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
                SpotlightU Admin{adminEmail ? ` · ${adminEmail}` : ""}
              </p>
              <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-[0.1em] uppercase text-foreground">
                Applications
              </h1>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 border border-border px-5 py-3 text-xs tracking-[0.2em] uppercase text-foreground hover:bg-muted transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {loadError && (
            <p className="mb-8 text-xs tracking-[0.1em] text-destructive font-light">{loadError}</p>
          )}

          {!loadError && isLoading ? (
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground animate-pulse-soft">
              Loading applications
            </p>
          ) : !loadError && applications.length === 0 ? (
            <div className="border border-dashed border-border py-24 text-center">
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground">
                No applications yet
              </p>
              <p className="mt-4 text-xs text-muted-foreground/70 font-light">
                New submissions will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border border-border p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-base font-medium text-foreground truncate">
                          {app.first_name} {app.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground font-light truncate">
                          {app.email}
                        </p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {[
                        ["Age", String(app.age)],
                        ["Height", app.height],
                        ["Location", app.location],
                        ["Instagram", app.instagram || "—"],
                      ].map(([label, value]) => (
                        <div key={label} className="min-w-0">
                          <dt className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                            {label}
                          </dt>
                          <dd className="text-foreground font-light truncate">{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <StatusControl
                      id={app.id}
                      status={app.status}
                      onChange={handleStatusChange}
                      isSaving={savingId === app.id}
                    />

                    <button
                      onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                      className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          expandedId === app.id ? "rotate-180" : ""
                        }`}
                      />
                      {expandedId === app.id ? "Hide details" : "View details"}
                    </button>

                    {expandedId === app.id && <ApplicationDetail app={app} />}
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Name", "Email", "Age", "Height", "Location", "Instagram", "Submitted", "Status", ""].map(
                        (heading, index) => (
                          <th
                            key={index}
                            className="px-4 py-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium whitespace-nowrap"
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <Fragment key={app.id}>
                        <tr className="border-b border-border last:border-b-0 align-top">
                          <td className="px-4 py-4 text-foreground font-medium whitespace-nowrap">
                            {app.first_name} {app.last_name}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground font-light">{app.email}</td>
                          <td className="px-4 py-4 text-foreground font-light">{app.age}</td>
                          <td className="px-4 py-4 text-foreground font-light whitespace-nowrap">
                            {app.height}
                          </td>
                          <td className="px-4 py-4 text-foreground font-light">{app.location}</td>
                          <td className="px-4 py-4 text-foreground font-light whitespace-nowrap">
                            {app.instagram || "—"}
                          </td>
                          <td className="px-4 py-4 text-muted-foreground font-light whitespace-nowrap">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4">
                            <StatusControl
                              id={app.id}
                              status={app.status}
                              onChange={handleStatusChange}
                              isSaving={savingId === app.id}
                            />
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                              aria-label="Toggle details"
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-300"
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ${
                                  expandedId === app.id ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                        {expandedId === app.id && (
                          <tr className="border-b border-border last:border-b-0">
                            <td colSpan={9} className="px-4 py-6 bg-muted/20">
                              <ApplicationDetail app={app} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <section className="mt-16 pt-8 border-t border-border max-w-[420px]">
            <h2 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="New password"
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Confirm new password"
                className="w-full px-0 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300 font-light"
              />

              {passwordMessage && (
                <p
                  className={`text-xs tracking-[0.1em] font-light ${
                    passwordMessage.ok ? "text-foreground" : "text-destructive"
                  }`}
                >
                  {passwordMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="border border-border px-6 py-3 text-xs tracking-[0.2em] uppercase text-foreground hover:bg-muted transition-colors duration-300 disabled:opacity-50"
              >
                {isChangingPassword ? "Updating" : "Update Password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;