import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { mockDailyTasks, mockUserProgress } from "../data/mockData";
import { DailyTask } from "../types";
import {
  CheckCircle,
  Circle,
  Flame,
  Target,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { useAppSelector } from "../app/hooks";

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>(
    useAppSelector((state) => state.task)
  );
  const [regenerating, setRegenerating] = useState(false);
  const toggleTask = (taskId: string | number) => {
    console.log(taskId);
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleRegeneratePlan = async () => {
    setRegenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setRegenerating(false);
  };

  const completedToday = tasks.filter((task) => task.completed).length;
  const progressToday =
    tasks.length > 0 ? (completedToday / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your progress today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Today's Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(progressToday)}%
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
                  {mockUserProgress.streak} days
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completed Tasks
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mockUserProgress.completedTasks}
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
                  {mockUserProgress.weeklyProgress}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
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
                <ProgressBar progress={progressToday} showLabel />
              </div>

              <div className="space-y-4">
                {tasks.length > 0
                  ? tasks?.map((task, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start p-4 border rounded-lg transition-all duration-200 hover:border-gray-300 ${
                          task.completed
                            ? "bg-gray-50 border-gray-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
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
                              task.completed ? "text-gray-400" : "text-gray-600"
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
                    ))
                  : ""}
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
                    <span>{mockUserProgress.weeklyProgress}%</span>
                  </div>
                  <ProgressBar progress={mockUserProgress.weeklyProgress} />
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {mockUserProgress.streak}
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
                  <span className="font-medium">
                    {mockUserProgress.totalTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-green-600">
                    {mockUserProgress.completedTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium">
                    {mockUserProgress.totalTasks -
                      mockUserProgress.completedTasks}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
