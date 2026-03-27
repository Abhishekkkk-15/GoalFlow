import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { createApiClient } from "../api/client";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { EmptyState } from "../components/ui/EmptyState";
import { Bell, LineChart, Settings2, UserRound } from "lucide-react";

type PreferencesPayload = {
  dashboard?: {
    defaultView?: "daily" | "weekly" | "monthly";
    showCompleted?: boolean;
    sortBy?: "dueDate" | "priority" | "category";
  };
  notifications?: {
    email?: boolean;
    push?: boolean;
    reminderTime?: number;
  };
  analytics?: {
    showTrends?: boolean;
    preferredChartType?: "line" | "bar" | "calendar";
    metricsToShow?: string[];
  };
};

const metricOptions = ["completion", "streak", "category"];

export const Preferences: React.FC = () => {
  const { getToken } = useAuth();
  const [prefs, setPrefs] = useState<PreferencesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as { error?: string } | undefined;
      if (typeof data?.error === "string" && data.error.trim()) return data.error;
      if (typeof err.response?.statusText === "string" && err.response.statusText) {
        return err.response.statusText;
      }
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const fetchPrefs = async () => {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");
    const api = createApiClient(token);
    const res = await api.get("/api/preferences");
    setPrefs(res.data?.preferences ?? null);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        if (!alive) return;
        await fetchPrefs();
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Failed to load preferences"));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalized = useMemo(() => {
    return {
      dashboard: {
        defaultView: prefs?.dashboard?.defaultView ?? "daily",
        showCompleted: prefs?.dashboard?.showCompleted ?? false,
        sortBy: prefs?.dashboard?.sortBy ?? "dueDate",
      },
      notifications: {
        email: prefs?.notifications?.email ?? true,
        push: prefs?.notifications?.push ?? true,
        reminderTime: prefs?.notifications?.reminderTime ?? 60,
      },
      analytics: {
        showTrends: prefs?.analytics?.showTrends ?? true,
        preferredChartType: prefs?.analytics?.preferredChartType ?? "line",
        metricsToShow: prefs?.analytics?.metricsToShow ?? metricOptions,
      },
    };
  }, [prefs]);

  const handleSave = async () => {
    const token = await getToken();
    if (!token) return;

    const api = createApiClient(token);
    setSaving(true);
    try {
      const updates = {
        dashboard: normalized.dashboard,
        notifications: normalized.notifications,
        analytics: normalized.analytics,
      };

      const res = await api.patch("/api/preferences", updates);
      setPrefs(res.data?.preferences ?? res.data ?? prefs);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save preferences"));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBillingPortal = async () => {
    setError(null);
    setBillingLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Missing Clerk token");
      const api = createApiClient(token);
      const res = await api.post("/api/billing/portal");
      const url = res.data?.url as string | undefined;
      if (!url) throw new Error("Missing portal URL");
      window.location.href = url;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to open billing portal"));
    } finally {
      setBillingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="Preferences"
            description="Loading preferences..."
          />
        </div>
      </div>
    );
  }

  if (error || !prefs) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="Preferences"
            description="We couldn't load your preferences."
          />
          <EmptyState
            title="Preferences unavailable"
            description={error ?? "Try again later."}
            icon={<Settings2 className="w-6 h-6" />}
            action={
              <Button
                variant="outline"
                onClick={() => window.location.reload()}>
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          title="Preferences"
          description="Customize your dashboard, notifications, and analytics."
        />

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings2 className="w-5 h-5 mr-2" />
            Billing
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Manage your paid plan, payment method, or cancellation in the Stripe
            customer portal.
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleOpenBillingPortal}
              loading={billingLoading}
              aria-label="Open billing portal">
              Open Billing Portal
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UserRound className="w-5 h-5 mr-2" />
            Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Default View
              </label>
              <select
                value={normalized.dashboard.defaultView}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...(prev ?? {}),
                    dashboard: {
                      ...(prev?.dashboard ?? {}),
                      defaultView: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly",
                    },
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sort By
              </label>
              <select
                value={normalized.dashboard.sortBy}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...(prev ?? {}),
                    dashboard: {
                      ...(prev?.dashboard ?? {}),
                      sortBy: e.target.value as
                        | "dueDate"
                        | "priority"
                        | "category",
                    },
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-end">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={normalized.dashboard.showCompleted}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...(prev ?? {}),
                      dashboard: {
                        ...(prev?.dashboard ?? {}),
                        showCompleted: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4"
                />
                Show Completed
              </label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-1 flex items-end">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={normalized.notifications.email}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...(prev ?? {}),
                      notifications: {
                        ...(prev?.notifications ?? {}),
                        email: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4"
                />
                Email Reminders
              </label>
            </div>

            <div className="md:col-span-1 flex items-end">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={normalized.notifications.push}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...(prev ?? {}),
                      notifications: {
                        ...(prev?.notifications ?? {}),
                        push: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4"
                />
                Push Reminders
              </label>
            </div>

            <div className="md:col-span-1">
              <Input
                label="Reminder Time (minutes)"
                type="number"
                value={normalized.notifications.reminderTime}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPrefs((prev) => ({
                    ...(prev ?? {}),
                    notifications: {
                      ...(prev?.notifications ?? {}),
                      reminderTime: Number.isFinite(value) ? value : 60,
                    },
                  }));
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-1 flex items-end">
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={normalized.analytics.showTrends}
                  onChange={(e) =>
                    setPrefs((prev) => ({
                      ...(prev ?? {}),
                      analytics: {
                        ...(prev?.analytics ?? {}),
                        showTrends: e.target.checked,
                      },
                    }))
                  }
                  className="h-4 w-4"
                />
                Show Trends
              </label>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preferred Chart
              </label>
              <select
                value={normalized.analytics.preferredChartType}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...(prev ?? {}),
                    analytics: {
                      ...(prev?.analytics ?? {}),
                      preferredChartType: e.target.value as
                        | "line"
                        | "bar"
                        | "calendar",
                    },
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white">
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="calendar">Calendar</option>
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Metrics to Show
              </label>
              <div className="space-y-2">
                {metricOptions.map((m) => {
                  const checked =
                    normalized.analytics.metricsToShow.includes(m);
                  return (
                    <label
                      key={m}
                      className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setPrefs((prev) => {
                            const current = normalized.analytics.metricsToShow;
                            const next = e.target.checked
                              ? Array.from(new Set([...current, m]))
                              : current.filter((x) => x !== m);
                            return {
                              ...(prev ?? {}),
                              analytics: {
                                ...(prev?.analytics ?? {}),
                                metricsToShow: next,
                              },
                            };
                          });
                        }}
                        className="h-4 w-4"
                      />
                      {m[0].toUpperCase() + m.slice(1)}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            loading={saving}
            className="bg-black hover:bg-gray-800 text-white">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
