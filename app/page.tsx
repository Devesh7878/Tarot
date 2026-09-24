"use client";

import { useEffect, useState, type FormEvent } from "react";

type AppUser = {
  id: string;
  name: string;
  email: string;
};

type KitSummary = {
  id: string;
  title: string;
  companyUrl: string;
  days: number;
  coverage?: Record<string, number>;
  kit?: any;
};

const defaultForm = {
  jobDescription: "Senior frontend engineer with React, TypeScript, product design, mentoring, and stakeholder communication responsibilities.",
  companyUrl: "https://example.com/careers",
  days: 5,
};

export default function Home() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [kits, setKits] = useState<KitSummary[]>([]);
  const [selectedKit, setSelectedKit] = useState<any | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [loadingKits, setLoadingKits] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loadingKit, setLoadingKit] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchKits() {
    setLoadingKits(true);
    try {
      const response = await fetch("/api/kits");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not load your saved kits.");
      }
      setKits(payload.kits || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load kits.");
    } finally {
      setLoadingKits(false);
    }
  }

  async function loadSession() {
    try {
      const response = await fetch("/api/me");
      const payload = await response.json();
      if (response.ok && payload.user) {
        setUser(payload.user);
        await fetchKits();
      } else {
        setUser(null);
        setKits([]);
      }
    } catch {
      setUser(null);
      setKits([]);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoadingAuth(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Authentication failed.");
      }

      setUser(payload.user);
      setAuthForm({ name: "", email: "", password: "" });
      setMessage(authMode === "login" ? "Welcome back." : "Account created successfully.");
      await fetchKits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoadingAuth(false);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoadingKit(true);

    try {
      const response = await fetch("/api/generate-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Could not generate the interview kit.");
      }

      setSelectedKit(payload.kit);
      setMessage("Interview kit generated and saved to your profile.");
      await fetchKits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The kit could not be generated.");
    } finally {
      setLoadingKit(false);
    }
  }

  function updateDays(nextDays: number) {
    const days = Math.min(60, Math.max(1, Math.round(nextDays) || 1));
    setForm((current) => ({ ...current, days }));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setKits([]);
    setSelectedKit(null);
    setMessage("You are signed out.");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-800 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Trao Interview Prep
              </p>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">AI interview preparation kits</h1>
            </div>
            {user ? (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white">
                <div>
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-slate-300">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Sign in to save your prep kits.
              </div>
            )}
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}
        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>
        ) : null}

        {!user ? (
          <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-6 flex rounded-full bg-slate-100 p-1">
                {[
                  { id: "login", label: "Login" },
                  { id: "register", label: "Register" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAuthMode(tab.id)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                      authMode === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
                    <input
                      value={authForm.name}
                      onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500"
                      placeholder="Jane Doe"
                    />
                  </div>
                ) : null}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loadingAuth ? "Please wait..." : authMode === "login" ? "Login" : "Create account"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-8 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">How it works</p>
              <div className="mt-6 space-y-5">
                {[
                  "Paste a job description and company URL",
                  "Extract the must-have requirements and questions",
                  "Generate flashcards and a study schedule",
                  "Save it and revisit it anytime",
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm text-slate-100">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[420px_1fr]">
            <form onSubmit={handleGenerate} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Generate new kit</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Saved to MongoDB</span>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Job description</label>
                  <textarea
                    rows={12}
                    value={form.jobDescription}
                    onChange={(event) => setForm((current) => ({ ...current, jobDescription: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
                    placeholder="Paste job description..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Company URL</label>
                  <input
                    value={form.companyUrl}
                    onChange={(event) => setForm((current) => ({ ...current, companyUrl: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500"
                    placeholder="https://company.com/careers"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Days</label>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 focus-within:border-blue-500">
                    <button
                      type="button"
                      aria-label="Decrease study days"
                      onClick={() => updateDays(form.days - 1)}
                      disabled={form.days <= 1}
                      className="h-10 w-10 rounded-xl text-xl font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={form.days}
                      onChange={(event) => updateDays(Number(event.target.value))}
                      className="min-w-0 flex-1 bg-transparent p-2 text-center text-sm font-semibold outline-none"
                      aria-label="Study days"
                    />
                    <button
                      type="button"
                      aria-label="Increase study days"
                      onClick={() => updateDays(form.days + 1)}
                      disabled={form.days >= 60}
                      className="h-10 w-10 rounded-xl text-xl font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Choose between 1 and 60 days.</p>
                </div>

                <button
                  type="submit"
                  disabled={loadingKit}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loadingKit ? "Generating..." : "Generate interview kit"}
                </button>
              </div>
            </form>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Saved kits</h2>
                  <span className="text-xs text-slate-500">{kits.length} total</span>
                </div>
                {loadingKits ? (
                  <p className="text-sm text-slate-500">Loading your kits...</p>
                ) : kits.length === 0 ? (
                  <p className="text-sm text-slate-500">No saved kits yet. Generate your first one.</p>
                ) : (
                  <div className="space-y-3">
                    {kits.map((kit) => (
                      <button
                        key={kit.id}
                        type="button"
                        onClick={() => setSelectedKit(kit.kit || null)}
                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{kit.title}</div>
                          <div className="text-xs text-slate-500">{kit.days} days · {kit.companyUrl}</div>
                        </div>
                        <span className="text-xs text-slate-500">View</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!selectedKit ? (
                <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 shadow-sm">
                  Your prep kit preview will show here after generation.
                </div>
              ) : (
                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Company brief</p>
                        <h3 className="mt-2 text-2xl font-bold">{selectedKit.companyBrief?.title}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {selectedKit.coverage?.covered || 0}/{selectedKit.coverage?.total || 0} covered
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{selectedKit.companyBrief?.summary}</p>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Role breakdown</h3>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{selectedKit.roleBreakdown}</p>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold">Day-by-day plan</h3>
                      <span className="text-xs text-slate-500">{selectedKit.days || selectedKit.schedule?.length || 0} days</span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {selectedKit.schedule?.map((day: any) => (
                        <div key={day.day} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-800">Day {day.day}</span>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">{day.topic}</span>
                          </div>
                          <p className="mt-3 text-sm font-medium text-slate-700">{day.focus}</p>
                          <p className="mt-1 text-xs text-slate-500">Topic range: Days {day.topicRange}</p>
                          <p className="mt-1 text-xs text-slate-500">{day.duration} minutes</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold">Question bank</h3>
                    <div className="mt-4 space-y-4">
                      {selectedKit.questionBank?.map((question: any) => (
                        <div key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{question.category}</span>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">{question.requirementId}</span>
                          </div>
                          <p className="mt-3 font-medium text-slate-800">{question.question}</p>
                          <p className="mt-2 text-sm text-slate-600">{question.answerOutline}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
