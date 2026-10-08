import { Fragment, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  ChevronDown,
  KeyRound,
  LogOut,
  Search,
  X,
} from "lucide-react";
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
import {
  filterApplications,
  formatExactTime,
  formatRelativeTime,
  getStatusCounts,
  sortApplications,
  type SortField,
  type SortOrder,
} from "@/lib/adminFilters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    className={`inline-flex items-center border px-2.5 py-0.5 text-[10px] tracking-[0.2em] uppercase font-medium ${
      statusStyles[status] ?? statusStyles.new
    }`}
  >
    {status}
  </span>
);

const StatusControl = ({
  id,
  applicantName,
  status,
  onChange,
  isSaving,
}: {
  id: string;
  applicantName: string;
  status: ApplicationStatus;
  onChange: (id: string, status: ApplicationStatus) => void;
  isSaving: boolean;
}) => (
  <select
    value={status}
    disabled={isSaving}
    aria-label={`Application status for ${applicantName}`}
    onChange={(e) => onChange(id, e.target.value as ApplicationStatus)}
    className="w-full sm:w-auto bg-transparent border border-border text-foreground text-xs tracking-[0.1em] uppercase py-2 px-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 disabled:opacity-50 min-h-[44px]"
  >
    {APPLICATION_STATUSES.map((value) => (
      <option key={value} value={value} className="bg-background text-foreground">
        {value}
      </option>
    ))}
  </select>
);

const PhotoStrip = ({ app }: { app: Application }) => {
  const paths = [
    app.headshot_url,
    app.fullbody_url,
    app.profile_url,
    ...(app.additional_urls ?? []),
  ].filter((path): path is string => Boolean(path));
  const pathsKey = paths.join("|");
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase || !pathsKey) return;
    let active = true;

    Promise.all(
      pathsKey.split("|").filter(Boolean).map(async (path) => {
        const { data } = await supabase.storage
          .from("applicant-photos")
          .createSignedUrl(path, SIGNED_URL_TTL);
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
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
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
    {app.notes && (
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Internal Notes
        </p>
        <p className="text-foreground font-light leading-relaxed whitespace-pre-wrap bg-muted/30 p-3 border border-border">
          {app.notes}
        </p>
      </div>
    )}
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
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);

  // Settings & Auth State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    text: string;
    ok: boolean;
  } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    let alive = true;
    getAdminSession().then(({ session }) => {
      if (!alive) return;
      setAdminEmail((session as Session | null)?.user?.email ?? null);
    });
    listApplications().then(({ data, error }) => {
      if (!alive) return;
      if (error) setLoadError(`Failed to load applications: ${error.message}`);
      setApplications(Array.isArray(data) ? data : []);
      setIsLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setSavingIds((prev) => new Set(prev).add(id));
    setLoadError(null);

    const { error } = await updateApplicationStatus(id, status);

    if (error) {
      setLoadError(error.message);
    } else {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    }

    setSavingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
    setPasswordMessage({ text: "Password updated successfully.", ok: true });
  };

  const handleSettingsOpenChange = (open: boolean) => {
    setIsSettingsOpen(open);
    if (!open) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage(null);
      setIsChangingPassword(false);
    }
  };

  // Filtered and Sorted list with deferred debounced search
  const filteredAndSortedApplications = useMemo(() => {
    const filtered = filterApplications(applications, deferredSearchQuery, selectedStatus);
    return sortApplications(filtered, sortBy, sortOrder);
  }, [applications, deferredSearchQuery, selectedStatus, sortBy, sortOrder]);

  const counts = useMemo(() => getStatusCounts(applications), [applications]);

  const isFilteringActive =
    searchQuery.trim() !== "" ||
    selectedStatus !== "all" ||
    sortBy !== "date" ||
    sortOrder !== "desc";

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSortBy("date");
    setSortOrder("desc");
    setExpandedId(null);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | SpotlightU</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-[1400px] mx-auto px-5 lg:px-[60px] py-12 lg:py-20">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 pb-6 border-b border-border">
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                SpotlightU Admin{adminEmail ? ` · ${adminEmail}` : ""}
              </p>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl md:text-4xl font-sans font-bold tracking-[0.1em] uppercase text-foreground">
                  Applications
                </h1>
                {!isLoading && (
                  <span className="text-sm font-light text-muted-foreground tracking-[0.1em]">
                    ({applications.length})
                  </span>
                )}
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Settings Trigger Dialog */}
              <Dialog open={isSettingsOpen} onOpenChange={handleSettingsOpenChange}>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open Admin Settings"
                    className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-xs tracking-[0.2em] uppercase text-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 min-h-[44px]"
                  >
                    <KeyRound className="w-4 h-4 text-muted-foreground" />
                    <span>Settings</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[440px] border-border bg-background p-6">
                  <DialogHeader className="mb-4">
                    <DialogTitle className="text-lg font-sans font-bold tracking-[0.1em] uppercase text-foreground">
                      Admin Settings
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {adminEmail ? `Logged in as ${adminEmail}` : "Manage security credentials."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div>
                      <label
                        htmlFor="new-admin-password"
                        className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5"
                      >
                        New Password
                      </label>
                      <input
                        id="new-admin-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2.5 bg-transparent border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 font-light"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="confirm-admin-password"
                        className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1.5"
                      >
                        Confirm New Password
                      </label>
                      <input
                        id="confirm-admin-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2.5 bg-transparent border border-border text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 font-light"
                      />
                    </div>

                    {passwordMessage && (
                      <p
                        className={`text-xs tracking-[0.05em] font-light ${
                          passwordMessage.ok ? "text-emerald-500" : "text-destructive"
                        }`}
                      >
                        {passwordMessage.text}
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSettingsOpenChange(false)}
                        className="px-4 py-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="border border-border bg-foreground text-background px-5 py-2 text-xs tracking-[0.2em] uppercase hover:bg-foreground/90 transition-colors duration-300 disabled:opacity-50 min-h-[44px]"
                      >
                        {isChangingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <button
                onClick={handleSignOut}
                aria-label="Sign Out of Admin"
                className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-xs tracking-[0.2em] uppercase text-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {loadError && (
            <p className="mb-8 text-xs tracking-[0.1em] text-destructive font-light">{loadError}</p>
          )}

          {!loadError && isLoading ? (
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground animate-pulse-soft py-12">
              Loading applications...
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
              {/* Controls Section: Search, Status Tabs, Sorting */}
              <div className="space-y-5 mb-8">
                {/* Status Tabs */}
                <div
                  role="tablist"
                  aria-label="Filter applications by status"
                  className="flex flex-wrap items-center gap-2 border-b border-border pb-3"
                >
                  {(
                    [
                      { key: "all", label: "All" },
                      { key: "new", label: "New" },
                      { key: "reviewing", label: "Reviewing" },
                      { key: "accepted", label: "Accepted" },
                      { key: "declined", label: "Declined" },
                    ] as const
                  ).map((tab) => {
                    const count = counts[tab.key];
                    const isActive = selectedStatus === tab.key;
                    return (
                      <button
                        key={tab.key}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setSelectedStatus(tab.key)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-200 border min-h-[44px] ${
                          isActive
                            ? "border-foreground bg-foreground text-background font-medium"
                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 border ${
                            isActive
                              ? "border-background/40 text-background bg-background/20"
                              : "border-border text-muted-foreground bg-muted/40"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar & Sort Dropdowns */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <label htmlFor="admin-search" className="sr-only">
                      Search applications
                    </label>
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="admin-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, email, location, IG..."
                      className="w-full pl-10 pr-12 py-2.5 bg-transparent border border-border text-foreground placeholder:text-muted-foreground/60 text-xs tracking-[0.05em] focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 min-h-[44px]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search query"
                        className="absolute right-0 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="sort-applications-select"
                      className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground whitespace-nowrap"
                    >
                      Sort:
                    </label>
                    <select
                      id="sort-applications-select"
                      value={sortBy}
                      aria-label="Sort applications by field"
                      onChange={(e) => setSortBy(e.target.value as SortField)}
                      className="bg-transparent border border-border text-foreground text-xs tracking-[0.1em] uppercase py-2.5 px-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 min-h-[44px]"
                    >
                      <option value="date" className="bg-background text-foreground">
                        Date
                      </option>
                      <option value="name" className="bg-background text-foreground">
                        Name
                      </option>
                      <option value="age" className="bg-background text-foreground">
                        Age
                      </option>
                      <option value="height" className="bg-background text-foreground">
                        Height
                      </option>
                    </select>

                    <button
                      onClick={toggleSortOrder}
                      title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
                      aria-label={`Toggle sort order (currently ${
                        sortOrder === "asc" ? "Ascending" : "Descending"
                      })`}
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-2.5 text-xs text-foreground hover:bg-muted focus-visible:ring-1 focus-visible:ring-foreground transition-colors duration-300 min-h-[44px]"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] tracking-[0.15em] uppercase font-light">
                        {sortOrder === "desc" ? "Desc" : "Asc"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Filter Results Summary */}
                {isFilteringActive && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <p className="tracking-[0.05em] font-light">
                      Showing{" "}
                      <span className="text-foreground font-medium">
                        {filteredAndSortedApplications.length}
                      </span>{" "}
                      of {applications.length} applications
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-[11px] tracking-[0.15em] uppercase text-foreground underline underline-offset-4 hover:opacity-80 transition-opacity min-h-[44px] min-w-[44px] px-2 py-1"
                    >
                      <X className="w-3 h-3" />
                      Reset filters
                    </button>
                  </div>
                )}
              </div>

              {/* Zero Filtered Results */}
              {filteredAndSortedApplications.length === 0 ? (
                <div className="border border-border/80 py-16 px-4 text-center space-y-3 bg-muted/10">
                  <p className="text-sm tracking-[0.15em] uppercase text-foreground">
                    No matching applications
                  </p>
                  <p className="text-xs text-muted-foreground font-light max-w-sm mx-auto">
                    Try adjusting your search query or selecting a different status tab.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="border border-border px-4 py-2 text-xs tracking-[0.2em] uppercase text-foreground hover:bg-muted transition-colors duration-300 min-h-[44px]"
                  >
                    Clear Search & Filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Mobile cards */}
                  <div className="md:hidden space-y-4">
                    {filteredAndSortedApplications.map((app) => (
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
                            [
                              "Submitted",
                              <time
                                key="submitted"
                                dateTime={app.created_at}
                                title={formatExactTime(app.created_at)}
                                className="cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2"
                              >
                                {formatRelativeTime(app.created_at)}
                              </time>,
                            ],
                          ].map(([label, value]) => (
                            <div key={label as string} className="min-w-0">
                              <dt className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                                {label}
                              </dt>
                              <dd className="text-foreground font-light truncate">{value}</dd>
                            </div>
                          ))}
                        </dl>

                        <StatusControl
                          id={app.id}
                          applicantName={`${app.first_name} ${app.last_name}`}
                          status={app.status}
                          onChange={handleStatusChange}
                          isSaving={savingIds.has(app.id)}
                        />

                        <button
                          onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                          aria-expanded={expandedId === app.id}
                          aria-controls={`detail-mobile-${app.id}`}
                          aria-label={
                            expandedId === app.id
                              ? `Hide details for ${app.first_name} ${app.last_name}`
                              : `View details for ${app.first_name} ${app.last_name}`
                          }
                          className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px]"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              expandedId === app.id ? "rotate-180" : ""
                            }`}
                          />
                          {expandedId === app.id ? "Hide details" : "View details"}
                        </button>

                        {expandedId === app.id && (
                          <div id={`detail-mobile-${app.id}`}>
                            <ApplicationDetail app={app} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block border border-border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          {[
                            "Name",
                            "Email",
                            "Age",
                            "Height",
                            "Location",
                            "Instagram",
                            "Submitted",
                            "Status",
                            "",
                          ].map((heading, index) => (
                            <th
                              key={index}
                              className="px-4 py-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium whitespace-nowrap"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAndSortedApplications.map((app) => {
                          const rawHandle = (app.instagram || "").replace(/^@/, "").trim();
                          const isValidHandle = /^[A-Za-z0-9._]{1,30}$/.test(rawHandle);

                          return (
                            <Fragment key={app.id}>
                              <tr className="border-b border-border last:border-b-0 align-top hover:bg-muted/10 transition-colors">
                                <td className="px-4 py-4 text-foreground font-medium whitespace-nowrap">
                                  {app.first_name} {app.last_name}
                                </td>
                                <td className="px-4 py-4 text-muted-foreground font-light">
                                  {app.email}
                                </td>
                                <td className="px-4 py-4 text-foreground font-light">{app.age}</td>
                                <td className="px-4 py-4 text-foreground font-light whitespace-nowrap">
                                  {app.height}
                                </td>
                                <td className="px-4 py-4 text-foreground font-light">
                                  {app.location}
                                </td>
                                <td className="px-4 py-4 text-foreground font-light whitespace-nowrap">
                                  {isValidHandle ? (
                                    <a
                                      href={`https://instagram.com/${encodeURIComponent(rawHandle)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline underline-offset-2 text-foreground"
                                    >
                                      @{rawHandle}
                                    </a>
                                  ) : (
                                    app.instagram || "—"
                                  )}
                                </td>
                                <td className="px-4 py-4 text-muted-foreground font-light whitespace-nowrap">
                                  <time
                                    dateTime={app.created_at}
                                    title={formatExactTime(app.created_at)}
                                    className="cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2"
                                  >
                                    {formatRelativeTime(app.created_at)}
                                  </time>
                                </td>
                                <td className="px-4 py-4">
                                  <StatusControl
                                    id={app.id}
                                    applicantName={`${app.first_name} ${app.last_name}`}
                                    status={app.status}
                                    onChange={handleStatusChange}
                                    isSaving={savingIds.has(app.id)}
                                  />
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <button
                                    onClick={() =>
                                      setExpandedId(expandedId === app.id ? null : app.id)
                                    }
                                    aria-expanded={expandedId === app.id}
                                    aria-controls={`detail-desktop-${app.id}`}
                                    aria-label={
                                      expandedId === app.id
                                        ? `Hide details for ${app.first_name} ${app.last_name}`
                                        : `View details for ${app.first_name} ${app.last_name}`
                                    }
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
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
                                <tr
                                  id={`detail-desktop-${app.id}`}
                                  className="border-b border-border last:border-b-0"
                                >
                                  <td colSpan={9} className="px-4 py-6 bg-muted/20">
                                    <ApplicationDetail app={app} />
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;