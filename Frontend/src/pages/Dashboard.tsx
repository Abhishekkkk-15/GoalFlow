import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setTasks } from "../features/task/taskSlice";
import { PageHeader } from "../components/layout/PageHeader";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tasks = useAppSelector((state) => state.task);
  const [regenerating, setRegenerating] = useState(false);
  console.log(tasks);
  const toLocalDateKey = (input: string | Date) => {
    const d = typeof input === "string" ? new Date(input) : input;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const todayKey = useMemo(() => toLocalDateKey(today), [today]);

  const last7Keys = useMemo(() => {
    return new Set(
      Array.from({ length: 7 }, (_, idx) => {
        const d = new Date(today);
        d.setDate(d.getDate() - idx);
        return toLocalDateKey(d);
      })
    );
  }, [today]);

  // const stats = useMemo(() => {
  //   const tasksToday = tasks.filter(
  //     (task: DailyTask) => toLocalDateKey(task.dueDate) === todayKey
  //   );
  //   const completedToday = tasksToday.filter((task) => task.completed).length;
  //   const progressToday =
  //     tasksToday.length > 0 ? (completedToday / tasksToday.length) * 100 : 0;

  //   const tasksWeek = tasks.filter((task) =>
  //     last7Keys.has(toLocalDateKey(task.dueDate))
  //   );
  //   const completedThisWeek = tasksWeek.filter((task) => task.completed).length;
  //   const progressThisWeek =
  //     tasksWeek.length > 0 ? (completedThisWeek / tasksWeek.length) * 100 : 0;

  //   // "Streak" = consecutive days ending today where all tasks for the day are completed.
  //   let streak = 0;
  //   for (let i = 0; i < 400; i++) {
  //     const day = new Date(today);
  //     day.setDate(day.getDate() - i);
  //     const key = toLocalDateKey(day);
  //     const tasksOnDay = tasks.filter(
  //       (task) => toLocalDateKey(task.dueDate) === key
  //     );

  //     if (tasksOnDay.length === 0) break;
  //     const allDone = tasksOnDay.every((task) => task.completed);
  //     if (!allDone) break;
  //     streak++;
  //   }

  //   return { progressToday, completedThisWeek, progressThisWeek, streak };
  // }, [last7Keys, tasks, today, todayKey]);

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    dispatch(setTasks(updatedTasks));
  };

  const handleRegeneratePlan = async () => {
    setRegenerating(true);
    const ok = window.confirm(
      "Re-run onboarding to regenerate your plan and daily tasks?"
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

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const remainingTasks = totalTasks - completedTasks;
  // --- utils ---
  const normalizeDate = (d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  // CORE LOGIC (single source of truth)
  const isTaskForDate = (task: DailyTask, date: Date) => {
    const start = normalizeDate(new Date(task.startDate));
    const current = normalizeDate(date);

    if (start > current) return false;

    switch (task.frequency) {
      case "daily":
        return true;

      case "weekly":
        return start.getDay() === current.getDay();

      case "monthly":
        return start.getDate() === current.getDate();

      case "once":
        return start.getTime() === current.getTime();

      default:
        return false;
    }
  };

  // reusable function
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isTaskForDate(task, date));
  };
  const tasksToday = useMemo(() => {
    return getTasksForDate(today).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return 0;
    });
  }, [tasks, today]);
  const stats = useMemo(() => {
    const tasksToday = getTasksForDate(today);

    const completedToday = tasksToday.filter((t) => t.completed).length;
    const progressToday =
      tasksToday.length > 0 ? (completedToday / tasksToday.length) * 100 : 0;

    // last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return normalizeDate(d);
    });

    const tasksWeek = last7Days.flatMap((d) => getTasksForDate(d));

    const completedThisWeek = tasksWeek.filter((t) => t.completed).length;
    const progressThisWeek =
      tasksWeek.length > 0 ? (completedThisWeek / tasksWeek.length) * 100 : 0;

    // streak
    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const tasksOnDay = getTasksForDate(d);

      if (tasksOnDay.length === 0) break;

      const allDone = tasksOnDay.every((t) => t.completed);
      if (!allDone) break;

      streak++;
    }

    return {
      progressToday,
      completedThisWeek,
      progressThisWeek,
      streak,
    };
  }, [tasks, today]);
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
                  {stats.streak} days
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
                  className="flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate Plan
                </Button>
              </div>

              <div className="mb-6">
                <ProgressBar progress={stats.progressToday} showLabel />
              </div>

              <div className="space-y-4">
                {tasksToday.length === 0 ? (
                  <EmptyState
                    title="No tasks due today"
                    description="Complete onboarding to generate your daily plan, then come back tomorrow."
                    icon={<RotateCcw className="w-6 h-6" />}
                    action={
                      <Button
                        variant="outline"
                        onClick={handleRegeneratePlan}
                        loading={regenerating}
                        className="w-full sm:w-auto">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Regenerate Plan
                      </Button>
                    }
                  />
                ) : (
                  tasksToday.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start p-4 border rounded-lg transition-all duration-200 hover:border-gray-300 ${
                        task.completed
                          ? "bg-gray-50 border-gray-200"
                          : "bg-white border-gray-200"
                      }`}>
                      <button
                        type="button"
                        aria-label={`Mark task "${task.title}" as ${
                          task.completed ? "not completed" : "completed"
                        }`}
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mr-4 mt-1 flex-shrink-0">
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
                          }`}>
                          {task.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            task.completed ? "text-gray-400" : "text-gray-600"
                          }`}>
                          {task.description}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                            task.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                      {stats.streak}
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
