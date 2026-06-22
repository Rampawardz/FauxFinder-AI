import { useMemo, useState } from "react";
import { loginUser, registerUser } from "./services/authService";
import { analyzeProfile } from "./services/profileService";
import { createReport } from "./services/reportService";

const fields = [
  {
    key: "profile pic",
    label: "Profile picture",
    type: "select",
    options: [
      { label: "Missing", value: 0 },
      { label: "Present", value: 1 },
    ],
  },
  {
    key: "nums/length username",
    label: "Username digit ratio",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.8,
  },
  {
    key: "fullname words",
    label: "Full name words",
    type: "number",
    min: 0,
    step: 1,
    defaultValue: 1,
  },
  {
    key: "nums/length fullname",
    label: "Full name digit ratio",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.5,
  },
  {
    key: "name==username",
    label: "Name equals username",
    type: "select",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 1 },
    ],
  },
  {
    key: "description length",
    label: "Bio length",
    type: "number",
    min: 0,
    step: 1,
    defaultValue: 0,
  },
  {
    key: "external URL",
    label: "External URL",
    type: "select",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 1 },
    ],
  },
  {
    key: "private",
    label: "Private account",
    type: "select",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 1 },
    ],
  },
  {
    key: "#posts",
    label: "Posts",
    type: "number",
    min: 0,
    step: 1,
    defaultValue: 1,
  },
  {
    key: "#followers",
    label: "Followers",
    type: "number",
    min: 0,
    step: 1,
    defaultValue: 5,
  },
  {
    key: "#follows",
    label: "Following",
    type: "number",
    min: 0,
    step: 1,
    defaultValue: 900,
  },
];

const defaultProfile = fields.reduce((values, field) => {
  values[field.key] = field.defaultValue ?? field.options?.[0]?.value ?? "";
  return values;
}, {});

const emptyAuthForm = {
  username: "",
  email: "",
  password: "",
};

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem("fauxfinder_user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem("fauxfinder_user");
    return null;
  }
}

function toPercent(score) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) {
    return "0.00";
  }

  return (Number(score) * 100).toFixed(2);
}

function App() {
  const [user, setUser] = useState(readStoredUser);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authError, setAuthError] = useState("");
  const [loadingAuth, setLoadingAuth] = useState(false);

  const [profile, setProfile] = useState(defaultProfile);
  const [analysis, setAnalysis] = useState(null);
  const [report, setReport] = useState({
    reason: "",
    severity: "MEDIUM",
  });
  const [savedReport, setSavedReport] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState("");

  const riskPercent = useMemo(() => toPercent(analysis?.riskScore), [analysis]);

  const saveUser = (data) => {
    const nextUser = {
      userId: data.userId,
      username: data.username,
      email: data.email,
      role: data.role,
    };

    localStorage.setItem("fauxfinder_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setLoadingAuth(true);

    try {
      const data =
        authMode === "login"
          ? await loginUser(authForm.email, authForm.password)
          : await registerUser(
              authForm.username,
              authForm.email,
              authForm.password
            );

      saveUser(data);
      setAuthForm(emptyAuthForm);
    } catch (err) {
      setAuthError(
        err.response?.data?.error ||
          (authMode === "login" ? "Login failed." : "Registration failed.")
      );
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("fauxfinder_user");
    setUser(null);
    setAnalysis(null);
    setSavedReport(null);
    setError("");
  };

  const handleFieldChange = (key, value) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const buildPayload = () => {
    return fields.reduce((payload, field) => {
      payload[field.key] = Number(profile[field.key]);
      return payload;
    }, {});
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setAnalysis(null);
    setSavedReport(null);
    setLoadingAnalysis(true);

    try {
      const data = await analyzeProfile(buildPayload());
      setAnalysis(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Profile analysis failed. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleReport = async (event) => {
    event.preventDefault();

    if (!analysis?.isFake) {
      setError("Only fake profiles can be reported.");
      return;
    }

    const profileId = analysis.savedProfileId || analysis.profileId;

    if (!profileId) {
      setError("The analyzed profile was not saved. Please run analysis again.");
      return;
    }

    setError("");
    setLoadingReport(true);

    try {
      const data = await createReport(
        profileId,
        report.reason.trim(),
        report.severity,
        user.userId
      );
      setSavedReport(data);
      setReport((current) => ({ ...current, reason: "" }));
    } catch (err) {
      setError(err.response?.data?.error || "Report could not be saved.");
    } finally {
      setLoadingReport(false);
    }
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/fauxlogo.png"
                alt="FauxFinder AI"
                className="h-12 w-12 rounded-lg border border-slate-200 bg-white object-contain"
              />
              <div>
                <h1 className="text-3xl font-semibold">FauxFinder AI</h1>
                <p className="text-slate-500">Secure access for profile analysis</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Module</p>
                  <p className="text-lg font-semibold">ML Detection</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Output</p>
                  <p className="text-lg font-semibold">Risk Score</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Action</p>
                  <p className="text-lg font-semibold">Fake Profile Report</p>
                </div>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleAuthSubmit}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`h-10 rounded px-3 text-sm font-semibold transition ${
                  authMode === "login"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`h-10 rounded px-3 text-sm font-semibold transition ${
                  authMode === "register"
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Register
              </button>
            </div>

            <div className="space-y-4">
              {authMode === "register" && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Username
                  </span>
                  <input
                    value={authForm.username}
                    onChange={(event) =>
                      setAuthForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    minLength={2}
                    required
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) =>
                    setAuthForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  required
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) =>
                    setAuthForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  minLength={6}
                  required
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
            </div>

            {authError && (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingAuth}
              className="mt-5 h-10 w-full rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loadingAuth
                ? authMode === "login"
                  ? "Logging in"
                  : "Creating account"
                : authMode === "login"
                  ? "Login"
                  : "Create Account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/fauxlogo.png"
              alt="FauxFinder AI"
              className="h-10 w-10 rounded-lg border border-slate-200 object-contain"
            />
            <div>
              <h1 className="text-xl font-semibold">FauxFinder AI</h1>
              <p className="text-sm text-slate-500">
                Logged in as {user.username}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.35fr_0.65fr]">
        <form
          onSubmit={handleAnalyze}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Profile Analysis</h2>
              <p className="text-sm text-slate-500">
                Enter the Instagram profile signals used by the ML model.
              </p>
            </div>
            <button
              type="submit"
              disabled={loadingAnalysis}
              className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loadingAnalysis ? "Analyzing" : "Analyze Profile"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => (
              <label key={field.key} className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  {field.label}
                </span>
                {field.type === "select" ? (
                  <select
                    value={profile[field.key]}
                    onChange={(event) =>
                      handleFieldChange(field.key, Number(event.target.value))
                    }
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  >
                    {field.options.map((option) => (
                      <option key={option.label} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={profile[field.key]}
                    onChange={(event) =>
                      handleFieldChange(field.key, event.target.value)
                    }
                    className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  />
                )}
              </label>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error}
            </p>
          )}
        </form>

        <aside className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Risk Score</h2>
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  analysis?.isFake
                    ? "bg-red-50 text-red-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {analysis ? (analysis.isFake ? "Fake" : "Real") : "Waiting"}
              </span>
            </div>

            <div className="space-y-3">
              <div className="text-5xl font-semibold tracking-normal">
                {analysis ? riskPercent : "0.00"}
                <span className="text-xl text-slate-500">%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    analysis?.isFake ? "bg-red-500" : "bg-teal-500"
                  }`}
                  style={{ width: `${analysis ? riskPercent : 0}%` }}
                />
              </div>
              {analysis?.savedProfileId && (
                <p className="text-sm text-slate-500">
                  Saved profile ID: {analysis.savedProfileId}
                </p>
              )}
            </div>
          </section>

          {analysis?.isFake && (
            <form
              onSubmit={handleReport}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold">Report Fake Profile</h2>
              <label className="mb-3 block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Severity
                </span>
                <select
                  value={report.severity}
                  onChange={(event) =>
                    setReport((current) => ({
                      ...current,
                      severity: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">
                  Reason
                </span>
                <textarea
                  value={report.reason}
                  onChange={(event) =>
                    setReport((current) => ({
                      ...current,
                      reason: event.target.value,
                    }))
                  }
                  required
                  rows={4}
                  className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </label>
              <button
                type="submit"
                disabled={loadingReport || !report.reason.trim()}
                className="mt-4 h-10 w-full rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {loadingReport ? "Saving Report" : "Submit Report"}
              </button>
            </form>
          )}

          {savedReport && (
            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
              Report saved to database with ID{" "}
              {savedReport.reportId || savedReport.id}.
            </section>
          )}
        </aside>
      </section>
    </main>
  );
}

export default App;
