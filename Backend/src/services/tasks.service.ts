import mongoose from "mongoose";
import { Task, type ITask } from "../models/task.mode";
import { TaskAnalytics } from "../models/taskAnalytics.model";
import { plan as PlanModel } from "../models/plan.model";
import { User } from "../models/user.mode";
import { UserPreferences, type IUserPreferences } from "../models/userPreferences.model";

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const normalizeDateToMidnight = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toDateKey = (date: Date) =>
  normalizeDateToMidnight(date).toISOString().split("T")[0];

const shouldGenerateOnDate = (task: ITask, date: Date): boolean => {
  const currentDate = normalizeDateToMidnight(date);
  const dayOfWeek = currentDate.getDay();
  const dayOfMonth = currentDate.getDate();

  const effectiveStart = task.startDate
    ? normalizeDateToMidnight(task.startDate)
    : null;
  if (effectiveStart && currentDate < effectiveStart) return false;

  const effectiveEnd = task.recurrence?.endDate
    ? normalizeDateToMidnight(task.recurrence.endDate)
    : task.dueDate
      ? normalizeDateToMidnight(task.dueDate)
      : null;
  if (effectiveEnd && currentDate > effectiveEnd) return false;

  const interval = Math.max(1, task.recurrence?.interval ?? 1);

  const pattern =
    task.recurrence?.pattern ??
    (task.frequency === "daily" ||
    task.frequency === "weekly" ||
    task.frequency === "monthly" ||
    task.frequency === "quarterly"
      ? task.frequency
      : undefined);
  if (!pattern) return false;

  switch (pattern) {
    case "daily": {
      if (!effectiveStart) return true;
      if (interval === 1) return true;
      const dayDiff = Math.floor(
        (currentDate.getTime() - effectiveStart.getTime()) / 86400000
      );
      return dayDiff >= 0 && dayDiff % interval === 0;
    }
    case "weekly": {
      if (!effectiveStart) return false;
      const daysOfWeek = task.recurrence?.daysOfWeek;
      if (daysOfWeek?.length) {
        if (!daysOfWeek.includes(dayOfWeek)) return false;
      } else {
        if (effectiveStart.getDay() !== dayOfWeek) return false;
      }

      if (interval === 1) return true;

      const diffDays = Math.floor(
        (currentDate.getTime() - effectiveStart.getTime()) / 86400000
      );
      const weeksSinceBase = Math.floor(diffDays / 7);
      return diffDays >= 0 && weeksSinceBase % interval === 0;
    }
    case "monthly": {
      if (!effectiveStart) return false;
      const dom = task.recurrence?.dayOfMonth ?? effectiveStart.getDate();

      if (dom !== -1 && dom !== dayOfMonth) return false;

      if (dom === -1) {
        const lastDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
        if (dayOfMonth !== lastDay) return false;
      }

      if (interval === 1) return true;

      const startMonthIndex =
        effectiveStart.getFullYear() * 12 + effectiveStart.getMonth();
      const currentMonthIndex =
        currentDate.getFullYear() * 12 + currentDate.getMonth();
      const monthsDiff = currentMonthIndex - startMonthIndex;
      return monthsDiff >= 0 && monthsDiff % interval === 0;
    }
    case "quarterly": {
      if (!effectiveStart) return false;
      const startQuarter = Math.floor(effectiveStart.getMonth() / 3);
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      if (interval !== 1 && (currentQuarter - startQuarter) % interval !== 0)
        return false;

      const dom = task.recurrence?.dayOfMonth ?? effectiveStart.getDate();
      if (dom !== -1 && dom !== dayOfMonth) return false;

      if (dom === -1) {
        const lastDay = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
        if (dayOfMonth !== lastDay) return false;
      }

      return true;
    }
    default:
      return false;
  }
};

const formatTaskForDisplay = (
  task: ITask,
  instanceDate?: Date,
  instanceCompletion?: { completed: boolean; completedAt?: Date }
) => {
  const base = {
    id: task._id,
    title: task.title,
    description: task.description,
    category: task.category,
    priority: task.priority,
    frequency: task.frequency,
    completed: task.completed,
    completedAt: task.completedAt,
    dueDate: task.dueDate,
    isRecurring: task.isRecurring,
  };

  if (!instanceDate) return base;

  const dateKey = instanceDate.toISOString().split("T")[0];
  return {
    ...base,
    completed: instanceCompletion?.completed ?? false,
    completedAt: instanceCompletion?.completedAt,
    instanceDate,
    instanceId: `${task._id.toString()}_${dateKey}`,
  };
};

const generateTaskInstances = (
  task: ITask,
  startDate: Date,
  endDate: Date
) => {
  const instances: any[] = [];
  const currentDate = normalizeDateToMidnight(startDate);
  const rangeEnd = normalizeDateToMidnight(endDate);

  const completedByDateKey = new Map<string, { completedAt: Date }>();
  for (const ci of task.completedInstances ?? []) {
    if (!ci.date || !ci.completedAt) continue;
    completedByDateKey.set(toDateKey(ci.date), { completedAt: ci.completedAt });
  }

  while (currentDate <= rangeEnd) {
    if (shouldGenerateOnDate(task, currentDate)) {
      const instanceDate = normalizeDateToMidnight(currentDate);
      const dateKey = toDateKey(instanceDate);
      const found = completedByDateKey.get(dateKey);
      instances.push({
        ...formatTaskForDisplay(task, instanceDate, {
          completed: Boolean(found),
          completedAt: found?.completedAt,
        }),
        isRecurringInstance: true,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
};

export const getTasksForDateRange = async (
  planId: string,
  clerkUserId: string,
  startDate: Date,
  endDate: Date
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  const plan = await PlanModel.findOne({
    _id: planId,
    user: userObjectId,
  }).select("_id");
  if (!plan) throw new Error("Plan not found");

  const tasks = await Task.find({
    plan: planId,
    $or: [
      {
        frequency: { $in: ["one-time", "once"] },
        dueDate: { $gte: startDate, $lte: endDate },
      },
      {
        isRecurring: true,
        frequency: { $nin: ["one-time", "once"] },
      },
    ],
  });

  const allTasks: any[] = [];
  for (const task of tasks) {
    if (task.isRecurring) {
      allTasks.push(...generateTaskInstances(task, startDate, endDate));
      continue;
    }
    allTasks.push(formatTaskForDisplay(task));
  }

  return allTasks;
};

export const getTodayTasks = async (planId: string, clerkUserId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getTasksForDateRange(planId, clerkUserId, today, tomorrow);
};

export const getWeeklyTasks = async (planId: string, clerkUserId: string) => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);
  return getTasksForDateRange(planId, clerkUserId, startDate, endDate);
};

export const getMonthlyTasks = async (planId: string, clerkUserId: string) => {
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  return getTasksForDateRange(planId, clerkUserId, startDate, endDate);
};

const updateStreak = async (
  userObjectId: string,
  task: ITask,
  completionDate: Date,
  session: mongoose.ClientSession
) => {
  const thirtyDaysAgo = new Date(completionDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const completions = await TaskAnalytics.find({
    user: userObjectId,
    plan: task.plan,
    category: task.category,
    completed: true,
    date: { $gte: thirtyDaysAgo, $lte: completionDate },
  })
    .sort({ date: -1 })
    .session(session);

  let streak = 0;
  const currentDate = new Date(completionDate);

  for (const completion of completions) {
    const completionDateOnly = new Date(completion.date);
    if (completionDateOnly.toDateString() === currentDate.toDateString()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }
    break;
  }

  await TaskAnalytics.updateMany(
    { user: userObjectId, plan: task.plan, category: task.category, date: completionDate },
    { streak },
    { session }
  );

  return streak;
};

const getUserObjectIdFromClerk = async (clerkId: string) => {
  const user = await User.findOne({ clerkId }).select("_id");
  if (!user) return null;
  return user._id.toString();
};

export const completeTask = async (
  taskId: string,
  clerkUserId: string,
  instanceDate?: Date,
  completed: boolean = true
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const task = await Task.findById(taskId).session(session);
    if (!task) throw new Error("Task not found");

    const completionDate = instanceDate
      ? normalizeDateToMidnight(new Date(instanceDate))
      : normalizeDateToMidnight(new Date());

    if (!task.isRecurring) {
      task.completed = completed;
      task.completedAt = completed ? completionDate : undefined;
    } else {
      task.completedInstances = task.completedInstances ?? [];
      const dateKey = toDateKey(completionDate);
      const existingIndex = (task.completedInstances ?? []).findIndex(
        (ci) => ci.date && toDateKey(ci.date) === dateKey
      );

      if (completed) {
        if (existingIndex >= 0) {
          task.completedInstances[existingIndex].completedAt = new Date();
          task.completedInstances[existingIndex].date = completionDate;
        } else {
          task.completedInstances.push({
            date: completionDate,
            completedAt: new Date(),
          });
        }
      } else {
        if (existingIndex >= 0) {
          task.completedInstances.splice(existingIndex, 1);
        }
      }
    }

    await task.save({ session });

    let analytics: any = null;
    if (completed) {
      analytics = new TaskAnalytics({
        user: userObjectId,
        plan: task.plan,
        task: task._id,
        date: completionDate,
        weekNumber: getWeekNumber(completionDate),
        monthNumber: completionDate.getMonth() + 1,
        year: completionDate.getFullYear(),
        completed: true,
        category: task.category,
        frequency: task.frequency,
      });
      await analytics.save({ session });
    } else {
      await TaskAnalytics.deleteMany({
        user: userObjectId,
        plan: task.plan,
        task: task._id,
        category: task.category,
        date: completionDate,
        completed: true,
      }).session(session);
    }

    const streak = await updateStreak(userObjectId, task, completionDate, session);

    await session.commitTransaction();
    return { success: true, task, analytics, streak };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getTaskCompletionHistory = async (
  taskId: string,
  clerkUserId: string,
  days = 30
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return TaskAnalytics.find({
    task: taskId,
    user: userObjectId,
    date: { $gte: startDate },
  }).sort({ date: -1 });
};

const calculateDailyTrends = (analytics: any[], startDate: Date, endDate: Date) => {
  const trends: any[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayData = analytics.filter(
      (a) => a.date.toISOString().split("T")[0] === dateStr
    );

    const completedCount = dayData.filter((a) => a.completed).length;

    trends.push({
      date: dateStr,
      total: dayData.length,
      completed: completedCount,
      completionRate: dayData.length > 0 ? (completedCount / dayData.length) * 100 : 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return trends;
};

const calculateStreaks = async (analytics: any[]) => {
  const sorted = [...analytics].sort((a, b) => a.date.getTime() - b.date.getTime());
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let lastDate: Date | null = null;

  for (const entry of sorted) {
    if (!entry.completed) {
      streak = 0;
      continue;
    }

    const currentDate = new Date(entry.date);
    if (lastDate) {
      const dayDiff =
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
      if (dayDiff === 1) streak++;
      else if (dayDiff > 1) streak = 1;
    } else {
      streak = 1;
    }

    currentStreak = streak;
    longestStreak = Math.max(longestStreak, streak);
    lastDate = currentDate;
  }

  return { currentStreak, longestStreak };
};

const calculateWeeklyPerformance = (analytics: any[]) => {
  const weeks: Record<string, { total: number; completed: number }> = {};

  analytics.forEach((entry) => {
    const weekKey = `${entry.year}-W${entry.weekNumber}`;
    if (!weeks[weekKey]) weeks[weekKey] = { total: 0, completed: 0 };
    weeks[weekKey].total++;
    if (entry.completed) weeks[weekKey].completed++;
  });

  return Object.entries(weeks).map(([week, data]) => ({
    week,
    completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    totalTasks: data.total,
    completedTasks: data.completed,
  }));
};

const generateRecommendations = async (
  analytics: any[],
  categoryBreakdown: Record<string, { total: number; completed: number }>
) => {
  const recommendations: any[] = [];

  for (const [category, data] of Object.entries(categoryBreakdown)) {
    const rate = data.total > 0 ? data.completed / data.total : 0;
    if (rate < 0.5 && data.total > 5) {
      recommendations.push({
        category,
        message: `Your completion rate in ${category} is ${Math.round(
          rate * 100
        )}%. Consider breaking down tasks into smaller chunks.`,
        priority: "high",
      });
    }
  }

  const recentCompletion = analytics.slice(-7);
  const consistent = recentCompletion.length > 0 && recentCompletion.every((a) => a.completed);
  if (!consistent && recentCompletion.length > 0) {
    recommendations.push({
      category: "general",
      message: "Try to maintain a consistent schedule. Set reminders for your recurring tasks.",
      priority: "medium",
    });
  }

  const dayPerformance: Record<number, { total: number; completed: number }> = {};
  analytics.forEach((entry) => {
    const dayOfWeek = new Date(entry.date).getDay();
    if (!dayPerformance[dayOfWeek]) dayPerformance[dayOfWeek] = { total: 0, completed: 0 };
    dayPerformance[dayOfWeek].total++;
    if (entry.completed) dayPerformance[dayOfWeek].completed++;
  });

  let bestDay = -1;
  let bestRate = 0;
  for (const [dayStr, data] of Object.entries(dayPerformance)) {
    const rate = data.total > 0 ? data.completed / data.total : 0;
    const day = Number(dayStr);
    if (rate > bestRate && data.total > 3) {
      bestRate = rate;
      bestDay = day;
    }
  }

  if (bestDay !== -1) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    recommendations.push({
      category: "productivity",
      message: `You're most productive on ${dayNames[bestDay]}s with ${Math.round(
        bestRate * 100
      )}% completion rate. Consider scheduling important tasks on this day.`,
      priority: "low",
    });
  }

  return recommendations;
};

export const getUserAnalytics = async (
  clerkUserId: string,
  planId: string,
  timeframe: "daily" | "weekly" | "monthly" = "weekly"
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  const now = new Date();
  let startDate: Date;

  if (timeframe === "daily") {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === "monthly") {
    startDate = new Date(now);
    startDate.setMonth(now.getMonth() - 1);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
  }

  const analytics = await TaskAnalytics.find({
    user: userObjectId,
    plan: planId,
    date: { $gte: startDate, $lte: now },
  }).sort({ date: 1 });

  const totalTasks = analytics.length;
  const completedTasks = analytics.filter((a) => a.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const categoryBreakdown = analytics.reduce((acc, curr) => {
    const category = curr.category || "uncategorized";
    if (!acc[category]) acc[category] = { total: 0, completed: 0 };
    acc[category].total++;
    if (curr.completed) acc[category].completed++;
    return acc;
  }, {} as Record<string, { total: number; completed: number }>);

  const streaks = await calculateStreaks(analytics);
  const dailyTrends = calculateDailyTrends(analytics, startDate, now);
  const weeklyPerformance = calculateWeeklyPerformance(analytics);
  const recommendations = await generateRecommendations(analytics, categoryBreakdown);

  const categoryRates = Object.entries(categoryBreakdown).map(([category, data]) => ({
    category,
    completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
    totalTasks: data.total,
    completedTasks: data.completed,
  }));

  return {
    summary: {
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate),
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
    },
    categoryBreakdown: categoryRates,
    dailyTrends,
    weeklyPerformance,
    recommendations,
    timeframe,
    startDate,
    endDate: now,
  };
};

export const getTaskAnalytics = async (
  taskId: string,
  clerkUserId: string,
  days = 30
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analytics = await TaskAnalytics.find({
    task: taskId,
    user: userObjectId,
    date: { $gte: startDate },
  }).sort({ date: 1 });

  const completions = analytics.filter((a) => a.completed);
  const completionRate = analytics.length > 0 ? (completions.length / analytics.length) * 100 : 0;

  const avgCompletionTime =
    completions.length > 0
      ? completions.reduce((sum, curr) => sum + (curr.completionTime || 0), 0) /
        completions.length
      : 0;

  const streaks = await calculateStreaks(analytics);

  return {
    taskId,
    totalOccurrences: analytics.length,
    completedOccurrences: completions.length,
    completionRate: Math.round(completionRate),
    averageCompletionTime: avgCompletionTime,
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    history: analytics.map((a) => ({
      date: a.date,
      completed: a.completed,
      completionTime: a.completionTime,
      streak: a.streak,
    })),
  };
};

export const getUserPreferences = async (clerkUserId: string) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  let preferences = await UserPreferences.findOne({ user: userObjectId });

  if (!preferences) {
    preferences = new UserPreferences({
      user: userObjectId,
      dashboard: { defaultView: "daily", showCompleted: false, sortBy: "dueDate" },
      notifications: { email: true, push: true, reminderTime: 60 },
      analytics: {
        showTrends: true,
        preferredChartType: "line",
        metricsToShow: ["completion", "streak", "category"],
      },
    });
    await preferences.save();
  }

  return preferences;
};

export const updateUserPreferences = async (
  clerkUserId: string,
  updates: Partial<IUserPreferences>
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  return UserPreferences.findOneAndUpdate(
    { user: userObjectId },
    { $set: updates },
    { new: true, upsert: true }
  );
};

export const updateDashboardPreferences = async (
  clerkUserId: string,
  dashboardPrefs: Partial<IUserPreferences["dashboard"]>
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  return UserPreferences.findOneAndUpdate(
    { user: userObjectId },
    { $set: { dashboard: dashboardPrefs } },
    { new: true, upsert: true }
  );
};

export const updateNotificationPreferences = async (
  clerkUserId: string,
  notificationPrefs: Partial<IUserPreferences["notifications"]>
) => {
  const userObjectId = await getUserObjectIdFromClerk(clerkUserId);
  if (!userObjectId) throw new Error("User not found");

  return UserPreferences.findOneAndUpdate(
    { user: userObjectId },
    { $set: { notifications: notificationPrefs } },
    { new: true, upsert: true }
  );
};

