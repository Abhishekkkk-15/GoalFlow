import React from "react";
import { Card } from "../components/ui/Card";
import { mockPlan } from "../data/mockData";
import { Clock, Flag, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PlanCategory } from "../types";

export const Plan: React.FC = () => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const planData = useAppSelector((state) => state.plan);
  const title = useAppSelector((state) => state.title);
  const filterOutCat: PlanCategory[] = planData.flatMap((p) => p.categories);
  if (planData.length > 0)
    console.log("Data", planData, filterOutCat, "title  ", title);
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title.title}
          </h1>
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>
              Created on {new Date(title.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Plan Categories */}
        <div className="space-y-8">
          {filterOutCat?.map((category) => (
            <Card key={category.id} className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name}
                </h2>
                <p className="text-gray-600">{category.description}</p>
              </div>

              <div className="space-y-4">
                {category.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{task.description}</p>

                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{task.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Plan Summary */}
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plan Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockPlan.categories.length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {mockPlan.categories.reduce(
                  (total, category) => total + category.tasks.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">90</div>
              <div className="text-sm text-gray-600">Days Duration</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
