"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  listConnectors,
  initiateOAuth,
  createApiKeyConnection,
  validateConnection as validateByConnectorId,
  type Connector,
} from "../../lib/api/connectors";
import { type UnifiedEnvelope } from "../../lib/api/client";
import { Button, Card, ErrorBanner } from "../../components/ui";

/**
 * PUBLIC_INTERFACE
 * WizardPage implements a dynamic multi-step onboarding flow:
 * 1) Fetch connectors dynamically from /api/connectors
 * 2) Let user select a connector, then choose OAuth2/API Key/PAT based on capabilities
 * 3) Trigger OAuth redirect or present credential form
 * 4) On submit or callback, validate via API; redirect to /dashboard (/) on success
 */
type Step = "select-connector" | "select-auth" | "auth" | "validate" | "done";

export default function WizardPage() {
  const router = useRouter();
  const params = useSearchParams();

  // Step state
  const [step, setStep] = useState<Step>("select-connector");

  // Data state
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string>("");
  const [authMethod, setAuthMethod] = useState<"" | "oauth" | "api_key">("");

  // Credential inputs
  const [apiKey, setApiKey] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");

  // UX state
  const [loading, setLoading] = useState(false);
  const [errorEnv, setErrorEnv] = useState<UnifiedEnvelope | null>(null);
  const [infoMessage, setInfoMessage] = useState("");

  const selectedConnector = useMemo(
    () => connectors.find((c) => c.id === selectedConnectorId) ?? null,
    [connectors, selectedConnectorId]
  );

  // Handle OAuth callback landing: ?oauth=success|error&connectorId=...
  useEffect(() => {
    const oauth = params?.get("oauth");
    const connectorId = params?.get("connectorId");
    if (oauth && connectorId) {
      setSelectedConnectorId(connectorId);
      if (oauth === "success") {
        setStep("validate");
      } else if (oauth === "error") {
        setErrorEnv({
          ok: false,
          error: { code: "OAUTH_ERROR", message: "Authorization was not completed." },
        });
        setStep("auth");
      }
    }
  }, [params]);

  // Fetch connectors on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchConnectors() {
      setLoading(true);
      setErrorEnv(null);
      try {
        const resp = await listConnectors();
        if (!cancelled) {
          if (resp.ok && Array.isArray(resp.data)) {
            setConnectors(resp.data);
          } else {
            setErrorEnv(resp);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setErrorEnv({
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

  // Capability-based auth methods
  const availableAuthMethods: Array<"oauth" | "api_key"> = useMemo(() => {
    if (!selectedConnector) return [];
    return selectedConnector.authMethods && selectedConnector.authMethods.length > 0
      ? selectedConnector.authMethods
      : ["oauth", "api_key"]; // sensible default if backend doesn't specify
  }, [selectedConnector]);

  // Navigation helpers
  const canContinueFromConnector = !!selectedConnectorId;
  const canContinueFromAuth = !!authMethod;

  const goBack = useCallback(() => {
    setErrorEnv(null);
    setInfoMessage("");
    if (step === "select-auth") setStep("select-connector");
    else if (step === "auth") setStep("select-auth");
    else if (step === "validate") setStep("auth");
  }, [step]);

  const handleNextFromConnector = useCallback(() => {
    if (!canContinueFromConnector) return;
    // Reset any previously chosen auth on connector change
    setAuthMethod("");
    setStep("select-auth");
  }, [canContinueFromConnector]);

  const handleNextFromAuth = useCallback(() => {
    if (!canContinueFromAuth) return;
    setStep("auth");
  }, [canContinueFromAuth]);

  const handleInitiateOAuth = useCallback(async () => {
    if (!selectedConnector) return;
    setLoading(true);
    setErrorEnv(null);
    setInfoMessage("");
    try {
      const resp = await initiateOAuth(selectedConnector.id);
      if (resp.ok) {
        const url =
          resp.data && typeof resp.data === "object" && "authUrl" in resp.data
            ? (resp.data as { authUrl?: string }).authUrl
            : undefined;
        if (url) {
          setInfoMessage("Redirecting to provider...");
          window.location.href = url;
        } else {
          setErrorEnv({
            ok: false,
            error: { code: "MISSING_AUTH_URL", message: "Authorization URL not provided by backend." },
          });
        }
      } else {
        setErrorEnv(resp);
      }
    } catch (e) {
      setErrorEnv({
        ok: false,
        error: { code: "CLIENT_INITIATE_OAUTH_ERROR", message: "Failed to initiate OAuth", details: String(e) },
      });
    } finally {
      setLoading(false);
    }
  }, [selectedConnector]);

  const handleCreateApiKeyConnection = useCallback(async () => {
    if (!selectedConnector) return;
    if (!apiKey) {
      setErrorEnv({ ok: false, error: { code: "MISSING_API_KEY", message: "Please enter an API key or PAT." } });
      return;
    }
    setLoading(true);
    setErrorEnv(null);
    setInfoMessage("Creating connection...");
    try {
      const resp = await createApiKeyConnection(selectedConnector.id, { apiKey, apiBaseUrl });
      if (resp.ok) {
        setInfoMessage("Connection created. Validating...");
        setStep("validate");
      } else {
        setErrorEnv(resp);
      }
    } catch (e) {
      setErrorEnv({
        ok: false,
        error: { code: "CLIENT_CREATE_API_KEY_ERROR", message: "Failed to create connection", details: String(e) },
      });
    } finally {
      setLoading(false);
    }
  }, [selectedConnector, apiKey, apiBaseUrl]);

  const handleValidate = useCallback(async () => {
    if (!selectedConnector) return;
    setLoading(true);
    setErrorEnv(null);
    setInfoMessage("Validating connection...");
    try {
      const resp = await validateByConnectorId(selectedConnector.id);
      if (resp.ok) {
        setStep("done");
        setInfoMessage("Validation successful. Redirecting to dashboard...");
        setTimeout(() => router.push("/"), 700);
      } else {
        setErrorEnv(resp);
      }
    } catch (e) {
      setErrorEnv({
        ok: false,
        error: { code: "CLIENT_VALIDATE_ERROR", message: "Failed to validate connection", details: String(e) },
      });
    } finally {
      setLoading(false);
    }
  }, [router, selectedConnector]);

  return (
    <div className="min-h-[calc(100vh-64px)] w-full bg-gradient-to-b from-blue-500/10 to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Connection Wizard</h1>
          <p className="text-gray-600 mt-2">Connect your tools securely. Choose OAuth2 or API Key/PAT.</p>
        </header>

        <Progress step={step} />

        <div className="mt-6 space-y-6">
          {step === "select-connector" && (
            <Card title="Select Connector" loading={loading}>
              {!loading && connectors.length === 0 ? (
                <div className="text-gray-600">No connectors available.</div>
              ) : (
                <ConnectorGrid
                  connectors={connectors}
                  selectedId={selectedConnectorId}
                  onSelect={(id) => {
                    setSelectedConnectorId(id);
                    setErrorEnv(null);
                  }}
                />
              )}
              <div className="mt-6 flex justify-end">
                <Button variant="primary" onClick={handleNextFromConnector} disabled={!canContinueFromConnector}>
                  Next
                </Button>
              </div>
            </Card>
          )}

          {step === "select-auth" && (
            <Card
              title={`Choose Authentication${selectedConnector ? ` · ${selectedConnector.name}` : ""}`}
              subtitle="Select how you want to authenticate with the provider."
            >
              <AuthMethodSelect
                methods={availableAuthMethods}
                value={authMethod}
                onChange={(v) => {
                  setAuthMethod(v);
                  setErrorEnv(null);
                }}
              />
              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <Button variant="primary" onClick={handleNextFromAuth} disabled={!canContinueFromAuth}>
                  Continue
                </Button>
              </div>
            </Card>
          )}

          {step === "auth" && (
            <Card title="Authenticate">
              {authMethod === "oauth" && (
                <div className="space-y-4">
                  <p className="text-gray-700">You will be redirected to the provider to grant access.</p>
                  <Button variant="primary" onClick={handleInitiateOAuth} loading={loading}>
                    Start OAuth
                  </Button>
                </div>
              )}
              {authMethod === "api_key" && (
                <div className="space-y-4">
                  <Field label="API Key or PAT">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter API key or personal access token"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </Field>
                  <Field label="API Base URL (optional)">
                    <input
                      value={apiBaseUrl}
                      onChange={(e) => setApiBaseUrl(e.target.value)}
                      placeholder="https://api.your-provider.com"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </Field>
                  <div className="flex items-center gap-3">
                    <Button variant="primary" onClick={handleCreateApiKeyConnection} loading={loading}>
                      Save and Continue
                    </Button>
                    <Button variant="ghost" onClick={goBack}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {step === "validate" && (
            <Card title="Validate Connection">
              <p className="text-gray-700 mb-4">
                We will verify your connection is working correctly by calling the backend.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={handleValidate} loading={loading}>
                  Validate
                </Button>
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
              </div>
            </Card>
          )}

          {step === "done" && (
            <Card title="All set!">
              <div className="text-gray-700">Your connection is ready. Redirecting to the dashboard...</div>
            </Card>
          )}

          {(errorEnv && !errorEnv.ok) || infoMessage ? (
            <div className="space-y-3">
              {errorEnv && !errorEnv.ok && (
                <ErrorBanner
                  title={errorEnv.error?.code || "Error"}
                  message={errorEnv.error?.message || "An unexpected error occurred"}
                />
              )}
              {infoMessage && (
                <div className="w-full border rounded-lg px-4 py-3 bg-amber-50 border-amber-200 text-amber-800">
                  {infoMessage}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/**
 * Subcomponents
 */
function ConnectorGrid({
  connectors,
  selectedId,
  onSelect,
}: {
  connectors: Connector[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  if (!connectors || connectors.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
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
              borderColor: selected ? "#2563EB" : "#e5e7eb",
              backgroundColor: selected ? "#eff6ff" : "#ffffff",
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
  methods,
  value,
  onChange,
}: {
  methods: Array<"oauth" | "api_key">;
  value: "" | "oauth" | "api_key";
  onChange: (v: "oauth" | "api_key") => void;
}) {
  // Only show methods allowed by the connector
  const options = methods.map((m) =>
    m === "oauth"
      ? { key: "oauth" as const, title: "OAuth 2.0", desc: "Redirect to provider and grant access." }
      : { key: "api_key" as const, title: "API Key / PAT", desc: "Use a personal access token or API key." }
  );
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
              borderColor: selected ? "#2563EB" : "#e5e7eb",
              backgroundColor: selected ? "#eff6ff" : "#ffffff",
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      {children}
    </label>
  );
}

function Progress({ step }: { step: Step }) {
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
                borderColor: active ? "#2563EB" : "#e5e7eb",
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
