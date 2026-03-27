import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { onboardingQuestions } from "../data/questions";
import { QuestionResponse } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useAppDispatch } from "../app/hooks";
import { setTasks } from "../features/task/taskSlice";
import { setPlans } from "../features/plan/planSlice";
import { setTitle } from "../features/titleSlice";
import { createApiClient } from "../api/client";
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const currentQuestion = onboardingQuestions[currentStep];
  const progress = ((currentStep + 1) / onboardingQuestions.length) * 100;

  const dispatch = useAppDispatch();

  const getCurrentResponse = () => {
    return (
      responses.find((r) => r.questionId === currentQuestion.id)?.answer || ""
    );
  };

  const handleResponse = (answer: string | string[]) => {
    const updatedResponses = responses.filter(
      (r) => r.questionId !== currentQuestion.id
    );
    updatedResponses.push({ questionId: currentQuestion.id, answer });
    setResponses(updatedResponses);
  };

  const handleNext = () => {
    if (currentStep < onboardingQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const qAnda = onboardingQuestions.map((question) => {
        const response = responses.find((r) => r.questionId === question.id);
        return {
          question: question.question,
          answer: response?.answer ?? (question.required ? "" : ""),
        };
      });

      const token = await getToken();
      const api = createApiClient(token);

      const res = await api.post("/api/generate-plan", { qAnda });

      const savedPlan = res.data.data;
      dispatch(setPlans(savedPlan.categories ?? []));
      dispatch(
        setTitle({
          title: savedPlan.title ?? "",
          createdAt: savedPlan.createdAt ?? "",
        })
      );
      // Dashboard will fetch the latest date-based task instances.
      dispatch(setTasks([]));

      localStorage.setItem("onboarding-completed", "true");
      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const isCurrentResponseValid = () => {
    const response = getCurrentResponse();
    if (currentQuestion.type === "multiple-select") {
      return Array.isArray(response) && response.length > 0;
    }
    return response && response.toString().trim() !== "";
  };

  const renderQuestion = () => {
    const currentResponse = getCurrentResponse();

    switch (currentQuestion.type) {
      case "multiple-choice":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                onClick={() => handleResponse(option)}
                className={`w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-black ${
                  currentResponse === option
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}>
                {option}
              </button>
            ))}
          </div>
        );

      case "multiple-select":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const isSelected =
                Array.isArray(currentResponse) &&
                currentResponse.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => {
                    const current = Array.isArray(currentResponse)
                      ? currentResponse
                      : [];
                    const updated = isSelected
                      ? current.filter((item) => item !== option)
                      : [...current, option];
                    handleResponse(updated);
                  }}
                  className={`w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-black ${
                    isSelected ? "border-black bg-gray-50" : "border-gray-200"
                  }`}>
                  <div className="flex items-center justify-between">
                    {option}
                    {isSelected && (
                      <div className="w-4 h-4 bg-black rounded-full" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case "text":
        return (
          <Input
            placeholder="Type your answer here..."
            value={currentResponse as string}
            onChange={(e) => handleResponse(e.target.value)}
            className="w-full"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8">
          <div className="mb-8">
            <ProgressBar progress={progress} showLabel />
            <p className="text-sm text-gray-500 mt-2">
              Question {currentStep + 1} of {onboardingQuestions.length}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h2>
            {renderQuestion()}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isCurrentResponseValid()}
              loading={loading}
              className="flex items-center">
              {currentStep === onboardingQuestions.length - 1
                ? "Complete"
                : "Next"}
              {currentStep < onboardingQuestions.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
