import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { EmptyState } from "../components/ui/EmptyState";
import { DailyTask } from "../types";
import {
  CheckCircle,
  Circle,
  Flame,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { useAppDispatch } from "../app/hooks";
import { setPlans } from "../features/plan/planSlice";
import { setTasks } from "../features/task/taskSlice";
import { setTitle } from "../features/titleSlice";
import { PageHeader } from "../components/layout/PageHeader";
import { createApiClient } from "../api/client";

type PlanPayload = {
  _id?: string;
  id?: string;
  title?: string;
  createdAt?: string;
  categories?: { id?: string; name?: string; description?: string }[];
};

type AnalyticsResponse = {
  summary?: {
    currentStreak?: number;
  };
};

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [planId, setPlanId] = useState<string | null>(null);
  const [tasksToday, setTasksToday] = useState<DailyTask[]>([]);
  const [tasksWeek, setTasksWeek] = useState<DailyTask[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCompletion, setSavingCompletion] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const fetchAll = async () => {
    const token = await getToken();
    if (!token) throw new Error("Missing Clerk token");

    const api = createApiClient(token);
    const planRes = await api.get("/api/plans/current");
    const currentPlan: PlanPayload = planRes.data?.plan;
    const dbPlanId = currentPlan?._id ?? currentPlan?.id;
    if (!dbPlanId) throw new Error("Plan id missing in response");

    setPlanId(dbPlanId);
    dispatch(setPlans(currentPlan.categories ?? []));
    dispatch(
      setTitle({
        title: currentPlan.title ?? "Your Plan",
        createdAt: currentPlan.createdAt ?? "",
      })
    );

    const [todayRes, weekRes, analyticsRes] = await Promise.all([
      api.get(`/api/plans/${dbPlanId}/tasks/today`),
      api.get(`/api/plans/${dbPlanId}/tasks/weekly`),
      api.get(`/api/plans/${dbPlanId}/analytics?timeframe=weekly`),
    ]);

    const todayTasks: DailyTask[] = todayRes.data?.tasks ?? [];
    const weekTasks: DailyTask[] = weekRes.data?.tasks ?? [];

    setTasksToday(todayTasks);
    setTasksWeek(weekTasks);
    dispatch(setTasks(todayTasks));
    setAnalytics(analyticsRes.data?.analytics ?? null);
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        await fetchAll();
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const completedToday = tasksToday.filter((t) => t.completed).length;
    const progressToday =
      tasksToday.length > 0 ? (completedToday / tasksToday.length) * 100 : 0;

    const completedThisWeek = tasksWeek.filter((t) => t.completed).length;
    const progressThisWeek =
      tasksWeek.length > 0 ? (completedThisWeek / tasksWeek.length) * 100 : 0;

    return {
      progressToday,
      completedThisWeek,
      progressThisWeek,
    };
  }, [tasksToday, tasksWeek]);

  const currentStreak = analytics?.summary?.currentStreak ?? 0;

  const handleToggleTaskCompletion = async (task: DailyTask) => {
    if (!planId) return;
    if (savingCompletion) return;

    const token = await getToken();
    if (!token) return;
    const api = createApiClient(token);

    const nextCompleted = !task.completed;
    const instanceDate = task.instanceDate ? new Date(task.instanceDate) : undefined;
    const key = `${task.id}_${task.instanceId ?? ""}_${task.instanceDate ?? ""}`;

    setSavingCompletion(key);
    try {
      await api.post(`/api/tasks/${task.id}/complete`, {
        instanceDate: instanceDate ? instanceDate.toISOString() : undefined,
        completed: nextCompleted,
      });
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCompletion(null);
    }
  };

  const handleRegeneratePlan = async () => {
    setRegenerating(true);
    const ok = window.confirm(
      "Re-run onboarding to regenerate your plan and date-based task instances?"
    );
    if (!ok) {
      setRegenerating(false);
      return;
    }
    setTimeout(() => {
      setRegenerating(false);
      navigate("/onboarding");
    }, 400);
  };

  const totalTasks = tasksToday.length;
  const completedTasks = tasksToday.filter((task) => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="Dashboard"
          description="Welcome back! Here's your progress today."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.progressToday)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentStreak} days
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completed (7d)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedThisWeek}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Weekly Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.progressThisWeek)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Daily Tasks */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Today's Tasks
                </h2>
                <Button
                  variant="outline"
                  onClick={handleRegeneratePlan}
                  loading={regenerating}
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate Plan
                </Button>
              </div>

              <div className="mb-6">
                <ProgressBar progress={stats.progressToday} showLabel />
              </div>

              {loading ? (
                <div className="text-sm text-gray-600">Loading tasks...</div>
              ) : tasksToday.length === 0 ? (
                <EmptyState
                  title="No tasks due today"
                  description="Complete onboarding to generate your date-based plan, then come back tomorrow."
                  icon={<RotateCcw className="w-6 h-6" />}
                  action={
                    <Button
                      variant="outline"
                      onClick={handleRegeneratePlan}
                      loading={regenerating}
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Regenerate Plan
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {tasksToday.map((task) => {
                    const key = task.instanceId ?? task.id;
                    const isSaving = savingCompletion === `${task.id}_${task.instanceId ?? ""}_${task.instanceDate ?? ""}`;
                    return (
                      <div
                        key={key}
                        className={`flex items-start p-4 border rounded-lg transition-all duration-200 hover:border-gray-300 ${
                          task.completed
                            ? "bg-gray-50 border-gray-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <button
                          type="button"
                          aria-label={`Mark task "${task.title}" as ${
                            task.completed ? "not completed" : "completed"
                          }`}
                          onClick={() => handleToggleTaskCompletion(task)}
                          disabled={isSaving}
                          className="mr-4 mt-1 flex-shrink-0"
                        >
                          {task.completed ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>

                        <div className="flex-grow">
                          <h3
                            className={`font-medium ${
                              task.completed
                                ? "line-through text-gray-500"
                                : "text-gray-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p
                            className={`text-sm ${
                              task.completed
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {task.description}
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                              task.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {task.category}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Progress Summary */}
          <div>
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Weekly Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round(stats.progressThisWeek)}%</span>
                  </div>
                  <ProgressBar progress={stats.progressThisWeek} />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {currentStreak}
                    </div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-medium">{totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {completedTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">{remainingTasks}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

