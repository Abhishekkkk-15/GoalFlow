import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { createApiClient } from "../api/client";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { EmptyState } from "../components/ui/EmptyState";
import { Calendar, Flame, Target, TrendingUp } from "lucide-react";

type Timeframe = "daily" | "weekly" | "monthly";

type AnalyticsDailyTrend = {
  date: string;
  total: number;
  completed: number;
  completionRate: number;
};

type AnalyticsCategoryBreakdownRow = {
  category: string;
  completionRate: number;
  totalTasks: number;
  completedTasks: number;
};

type AnalyticsRecommendation = {
  category: string;
  message: string;
  priority?: string;
};

type AnalyticsSummary = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
};

type AnalyticsResponse = {
  summary?: Partial<AnalyticsSummary>;
  dailyTrends?: AnalyticsDailyTrend[];
  categoryBreakdown?: AnalyticsCategoryBreakdownRow[];
  recommendations?: AnalyticsRecommendation[];
};

export const Analytics: React.FC = () => {
  const { getToken } = useAuth();
  const [timeframe, setTimeframe] = useState<Timeframe>("weekly");
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanAndAnalytics = async () => {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");

    const api = createApiClient(token);
    const planRes = await api.get("/api/plans/current");
    const currentPlan = planRes.data?.plan;
    const dbPlanId = currentPlan?._id ?? currentPlan?.id;
    if (!dbPlanId) throw new Error("Plan id missing");

    const res = await api.get(
      `/api/plans/${dbPlanId}/analytics?timeframe=${timeframe}`
    );
    setAnalytics(res.data?.analytics ?? null);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        if (!alive) return;
        await fetchPlanAndAnalytics();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeframe]);

  const progressRate = useMemo(() => {
    const rate = analytics?.summary?.completionRate ?? 0;
    return typeof rate === "number" ? rate : 0;
  }, [analytics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader title="Analytics" description="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="Analytics"
            description="We couldn't load your analytics."
          />
          <EmptyState
            title="Analytics unavailable"
            description={error ?? "Try again later."}
            icon={<Target className="w-6 h-6" />}
            action={
              <Button onClick={() => setTimeframe("weekly")} variant="outline">
                Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const summary = analytics.summary ?? {};
  const dailyTrends: AnalyticsDailyTrend[] = analytics.dailyTrends ?? [];
  const categoryBreakdown: AnalyticsCategoryBreakdownRow[] =
    analytics.categoryBreakdown ?? [];
  const recommendations: AnalyticsRecommendation[] =
    analytics.recommendations ?? [];

  const dailyPreview = dailyTrends.slice(-14).reverse();

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Analytics"
          description="Track your completion, streaks, and insights."
        />

        {/* Timeframe controls */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["daily", "weekly", "monthly"] as Timeframe[]).map((t) => (
            <Button
              key={t}
              onClick={() => setTimeframe(t)}
              variant={timeframe === t ? "primary" : "outline"}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.completionRate ?? 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.currentStreak ?? 0}d
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalTasks ?? 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Longest Streak
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.longestStreak ?? 0}d
                </p>
              </div>
              <Calendar className="h-8 w-8 text-gray-600" />
            </div>
          </Card>
        </div>

        {/* Completion rate */}
        <div className="mb-6">
          <ProgressBar progress={progressRate} showLabel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Daily Trend
              </h3>
              {dailyPreview.length === 0 ? (
                <div className="text-sm text-gray-600">
                  No completion data yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {dailyPreview.map((row) => (
                    <div
                      key={row.date}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700">{row.date}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {row.completionRate?.toFixed?.(0) ?? row.completionRate}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recommendations
              </h3>
              {recommendations.length === 0 ? (
                <div className="text-sm text-gray-600">
                  Keep going. No recommendations for now.
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((r, idx) => (
                    <div key={`${r.category}_${idx}`} className="p-4 border rounded-lg border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {r.priority ? `${r.priority.toUpperCase()}: ` : ""}
                        {r.category}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {r.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Breakdown
              </h3>
              {categoryBreakdown.length === 0 ? (
                <div className="text-sm text-gray-600">
                  No category data yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {categoryBreakdown.map((row) => (
                    <div key={row.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{row.category}</span>
                        <span className="font-medium text-gray-900">
                          {(row.completionRate ?? 0).toFixed?.(0) ?? row.completionRate}%
                        </span>
                      </div>
                      <ProgressBar progress={row.completionRate ?? 0} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

