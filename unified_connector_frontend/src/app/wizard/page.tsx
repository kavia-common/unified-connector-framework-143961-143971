"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listConnectors,
  initiateOAuth,
  createApiKeyConnection,
  validateConnection,
  type Connector,
  type UnifiedEnvelope,
} from "../../lib/api/connectors";

/**
 * PUBLIC_INTERFACE
 * WizardPage is the multi-step connection onboarding page.
 * It guides users to:
 * 1) Select a connector (e.g., Jira/Confluence)
 * 2) Select an auth method (OAuth or API Key)
 * 3) Initiate the auth flow (redirect for OAuth or submit API key)
 * 4) Validate connection and redirect to dashboard on success
 *
 * Returns a client component for Next.js App Router at /wizard.
 */
type Step = "select-connector" | "select-auth" | "auth" | "validate" | "done";

export default function WizardPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>("select-connector");

  // Data state
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("");
  const [authMethod, setAuthMethod] = useState<"oauth" | "api_key" | "">("");

  // API key fields
  const [apiKey, setApiKey] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");

  // Loading and errors (unified envelope error handling)
  const [loading, setLoading] = useState(false);
  const [errorEnvelope, setErrorEnvelope] = useState<UnifiedEnvelope | null>(null);
  const [infoMessage, setInfoMessage] = useState<string>("");

  const selectedConnector = useMemo(
    () => connectors.find((c) => c.id === selectedConnectorId) ?? null,
    [connectors, selectedConnectorId]
  );

  // Fetch connectors on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchConnectors() {
      setLoading(true);
      setErrorEnvelope(null);
      try {
        const resp = await listConnectors();
        if (!cancelled) {
          if (resp.ok && Array.isArray(resp.data)) {
            setConnectors(resp.data);
          } else {
            // Handle error envelope
            setErrorEnvelope(resp);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setErrorEnvelope({
            ok: false,
            error: {
              code: "CLIENT_FETCH_ERROR",
              message: "Failed to load connectors",
              details: String(e),
            },
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchConnectors();
    return () => {
      cancelled = true;
    };
  }, []);

  // Navigation helpers
  const canContinueFromConnector = !!selectedConnectorId;
  const canContinueFromAuth = !!authMethod;

  const goBack = useCallback(() => {
    setErrorEnvelope(null);
    setInfoMessage("");
    if (step === "select-auth") {
      setStep("select-connector");
    } else if (step === "auth") {
      setStep("select-auth");
    } else if (step === "validate") {
      // go back to auth method so user can retry
      setStep("auth");
    }
  }, [step]);

  const handleNextFromConnector = useCallback(() => {
    if (!canContinueFromConnector) return;
    setStep("select-auth");
  }, [canContinueFromConnector]);

  const handleNextFromAuth = useCallback(() => {
    if (!canContinueFromAuth) return;
    setStep("auth");
  }, [canContinueFromAuth]);

  const handleInitiateOAuth = useCallback(async () => {
    if (!selectedConnector) return;
    setLoading(true);
    setErrorEnvelope(null);
    setInfoMessage("");
    try {
      const resp = await initiateOAuth(selectedConnector.id);
      if (resp.ok) {
        // Expect backend to return an authUrl for redirection
        const url = (resp.data && typeof resp.data === "object" && "authUrl" in resp.data)
          ? (resp.data as { authUrl?: string }).authUrl
          : undefined;
        if (url) {
          // Optional: show brief info before redirect
          setInfoMessage("Redirecting to provider for authorization...");
          // Redirect the browser to start OAuth
          window.location.href = url;
        } else {
          // If no url, show error
          setErrorEnvelope({
            ok: false,
            error: {
              code: "MISSING_AUTH_URL",
              message: "Authorization URL not provided by backend.",
            },
          });
        }
      } else {
        setErrorEnvelope(resp);
      }
    } catch (e) {
      setErrorEnvelope({
        ok: false,
        error: {
          code: "CLIENT_INITIATE_OAUTH_ERROR",
          message: "Failed to initiate OAuth flow",
          details: String(e),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [selectedConnector]);

  const handleCreateApiKeyConnection = useCallback(async () => {
    if (!selectedConnector) return;
    if (!apiKey) {
      setErrorEnvelope({
        ok: false,
        error: { code: "MISSING_API_KEY", message: "Please enter an API key." },
      });
      return;
    }
    setLoading(true);
    setErrorEnvelope(null);
    setInfoMessage("Creating connection...");
    try {
      const resp = await createApiKeyConnection(selectedConnector.id, {
        apiKey,
        apiBaseUrl,
      });
      if (resp.ok) {
        setInfoMessage("Connection created. Validating...");
        setStep("validate");
      } else {
        setErrorEnvelope(resp);
      }
    } catch (e) {
      setErrorEnvelope({
        ok: false,
        error: {
          code: "CLIENT_CREATE_API_KEY_ERROR",
          message: "Failed to create API key connection",
          details: String(e),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [selectedConnector, apiKey, apiBaseUrl]);

  const handleValidate = useCallback(async () => {
    if (!selectedConnector) return;
    setLoading(true);
    setErrorEnvelope(null);
    setInfoMessage("Validating connection...");
    try {
      const resp = await validateConnection(selectedConnector.id);
      if (resp.ok) {
        // Redirect to dashboard
        setStep("done");
        setInfoMessage("Validation successful. Redirecting to dashboard...");
        // Little delay for UX
        setTimeout(() => {
          router.push("/"); // assuming dashboard is at root
        }, 800);
      } else {
        setErrorEnvelope(resp);
      }
    } catch (e) {
      setErrorEnvelope({
        ok: false,
        error: {
          code: "CLIENT_VALIDATE_ERROR",
          message: "Failed to validate connection",
          details: String(e),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [router, selectedConnector]);

  // Ocean Professional theme helpers
  const theme = {
    primary: "#2563EB",
    secondary: "#F59E0B",
    error: "#EF4444",
    bg: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-b from-blue-500/10 to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            Connection Wizard
          </h1>
          <p className="text-gray-600 mt-2">
            Connect your tools securely using OAuth or API Key.
          </p>
        </header>

        <Progress step={step} theme={theme} />

        <div className="mt-6">
          {step === "select-connector" && (
            <Card>
              <SectionTitle title="Select Connector" />
              <ConnectorGrid
                connectors={connectors}
                selectedId={selectedConnectorId}
                onSelect={(id) => {
                  setSelectedConnectorId(id);
                  setErrorEnvelope(null);
                }}
                loading={loading}
                theme={theme}
              />
              <FooterNav
                onBack={undefined}
                onNext={canContinueFromConnector ? handleNextFromConnector : undefined}
                nextDisabled={!canContinueFromConnector}
                theme={theme}
              />
            </Card>
          )}

          {step === "select-auth" && (
            <Card>
              <SectionTitle
                title={`Choose Authentication ${selectedConnector ? `for ${selectedConnector.name}` : ""}`}
              />
              <AuthMethodSelect
                value={authMethod}
                onChange={(v) => {
                  setAuthMethod(v);
                  setErrorEnvelope(null);
                }}
                theme={theme}
              />
              <FooterNav
                onBack={goBack}
                onNext={canContinueFromAuth ? handleNextFromAuth : undefined}
                nextDisabled={!canContinueFromAuth}
                theme={theme}
              />
            </Card>
          )}

          {step === "auth" && (
            <Card>
              <SectionTitle title="Authenticate" />
              {authMethod === "oauth" && (
                <div className="space-y-4">
                  <p className="text-gray-700">
                    You will be redirected to the provider to grant access.
                  </p>
                  <button
                    onClick={handleInitiateOAuth}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"}`}
                    style={{ backgroundColor: theme.primary }}
                  >
                    {loading ? "Starting..." : "Start OAuth"}
                  </button>
                </div>
              )}
              {authMethod === "api_key" && (
                <div className="space-y-4">
                  <TextField
                    label="API Key"
                    placeholder="Enter API key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <TextField
                    label="API Base URL (optional)"
                    placeholder="https://your-domain.atlassian.net"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                  />
                  <button
                    onClick={handleCreateApiKeyConnection}
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"}`}
                    style={{ backgroundColor: theme.primary }}
                  >
                    {loading ? "Saving..." : "Save and Continue"}
                  </button>
                </div>
              )}
              <FooterNav onBack={goBack} onNext={undefined} theme={theme} />
            </Card>
          )}

          {step === "validate" && (
            <Card>
              <SectionTitle title="Validate Connection" />
              <p className="text-gray-700 mb-4">
                We will verify your connection is working correctly.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors shadow-sm ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"}`}
                  style={{ backgroundColor: theme.primary }}
                >
                  {loading ? "Validating..." : "Validate"}
                </button>
                <button
                  onClick={goBack}
                  className="inline-flex items-center px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </Card>
          )}

          {step === "done" && (
            <Card>
              <SectionTitle title="All Set!" />
              <p className="text-gray-700">
                Your connection is ready. Redirecting to the dashboard...
              </p>
            </Card>
          )}

          {/* Global error and info feedback */}
          <div className="mt-6 space-y-3">
            {errorEnvelope && !errorEnvelope.ok && (
              <ErrorBanner
                title={errorEnvelope.error?.message || "An error occurred"}
                details={errorEnvelope.error?.details}
                code={errorEnvelope.error?.code}
              />
            )}
            {infoMessage && (
              <InfoBanner message={infoMessage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable components below
 */

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">{children}</div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>;
}

function ConnectorGrid({
  connectors,
  selectedId,
  onSelect,
  loading,
  theme,
}: {
  connectors: Connector[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading: boolean;
  theme: { primary: string; secondary: string; error: string; bg: string; surface: string; text: string };
}) {
  if (loading && connectors.length === 0) {
    return <SkeletonConnectorList />;
  }
  if (!loading && connectors.length === 0) {
    return <p className="text-gray-600">No connectors available.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {connectors.map((c) => {
        const selected = c.id === selectedId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`flex items-center justify-between w-full p-4 rounded-lg border transition-all text-left ${selected ? "ring-2" : ""}`}
            style={{
              borderColor: selected ? theme.primary : "#e5e7eb",
              backgroundColor: selected ? "#eff6ff" : theme.surface,
              boxShadow: selected ? "0 0 0 2px rgba(37,99,235,0.2)" : undefined,
            }}
          >
            <div>
              <div className="font-medium text-gray-900">{c.name}</div>
              <div className="text-xs text-gray-500 mt-1">{c.description || "No description."}</div>
            </div>
            <span
              className={`ml-3 inline-flex items-center justify-center rounded-full border w-5 h-5 ${selected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
            >
              {selected && <span className="w-2 h-2 bg-white rounded-full" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function AuthMethodSelect({
  value,
  onChange,
  theme,
}: {
  value: "" | "oauth" | "api_key";
  onChange: (v: "oauth" | "api_key") => void;
  theme: { primary: string; secondary: string; error: string; bg: string; surface: string; text: string };
}) {
  const options: Array<{ key: "oauth" | "api_key"; title: string; desc: string }> = [
    { key: "oauth", title: "OAuth", desc: "Secure authorization via provider redirect." },
    { key: "api_key", title: "API Key", desc: "Use a personal access token or API key." },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((opt) => {
        const selected = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`w-full p-4 rounded-lg border text-left transition-all ${selected ? "ring-2" : ""}`}
            style={{
              borderColor: selected ? theme.primary : "#e5e7eb",
              backgroundColor: selected ? "#eff6ff" : theme.surface,
              boxShadow: selected ? "0 0 0 2px rgba(37,99,235,0.2)" : undefined,
            }}
          >
            <div className="font-medium text-gray-900">{opt.title}</div>
            <div className="text-sm text-gray-600 mt-1">{opt.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function TextField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function FooterNav({
  onBack,
  onNext,
  nextDisabled,
  theme,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  theme: { primary: string };
}) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div />
      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {onNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            className={`inline-flex items-center px-4 py-2 rounded-md text-white transition-colors shadow-sm ${nextDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-95"}`}
            style={{ backgroundColor: theme.primary }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({
  title,
  details,
  code,
}: {
  title: string;
  details?: string;
  code?: string;
}) {
  return (
    <div
      className="w-full rounded-md border px-4 py-3"
      style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
    >
      <div className="font-medium text-red-700">{title}</div>
      {code && <div className="text-xs text-red-600 mt-1">Code: {code}</div>}
      {details && <div className="text-sm text-red-600 mt-1">{details}</div>}
    </div>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <div
      className="w-full rounded-md border px-4 py-3"
      style={{ borderColor: "#fde68a", backgroundColor: "#fffbeb" }}
    >
      <div className="text-amber-800">{message}</div>
    </div>
  );
}

function SkeletonConnectorList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function Progress({ step, theme }: { step: Step; theme: { primary: string } }) {
  const steps: Array<{ key: Step; title: string }> = [
    { key: "select-connector", title: "Connector" },
    { key: "select-auth", title: "Auth Method" },
    { key: "auth", title: "Authenticate" },
    { key: "validate", title: "Validate" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, idx) => {
        const active = idx <= currentIndex;
        return (
          <li key={s.key} className="flex items-center">
            <div
              className={`px-3 py-1 rounded-full text-sm border`}
              style={{
                backgroundColor: active ? "#eff6ff" : "#fff",
                borderColor: active ? theme.primary : "#e5e7eb",
                color: active ? "#1e40af" : "#6b7280",
              }}
            >
              {s.title}
            </div>
            {idx < steps.length - 1 && <div className="w-6 h-px bg-gray-300 mx-2" />}
          </li>
        );
      })}
    </ol>
  );
}
