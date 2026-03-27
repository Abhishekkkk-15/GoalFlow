import React from "react";
import { SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Target, Brain, CheckCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Landing: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (user) {
    navigate("/dashboard");
  }
  const isConBoarderd = localStorage.getItem("onboarding-completed");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">
                    Transform Your Life with
                  </span>
                  <span className="block text-black xl:inline">
                    {" "}
                    AI-Powered Goals
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Get personalized plans, daily tasks, and AI coaching to
                  achieve your dream life. Track progress, build habits, and
                  stay motivated with intelligent insights.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl={
                        isConBoarderd ? "/dashboard" : "/onboarding"
                      }>
                      <Button size="lg" className="w-full px-8 py-4">
                        Start Your Journey
                      </Button>
                    </SignInButton>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gray-100 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-8xl text-gray-300">
              <Target />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-black font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Four Simple Steps to Success
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex justify-center">
                  <Brain className="h-12 w-12 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  1. Answer Questions
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Tell us about your goals, challenges, and preferences
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <Target className="h-12 w-12 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  2. Get AI Plan
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Receive a personalized roadmap tailored to your needs
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  3. Daily Tasks
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Complete bite-sized tasks that move you forward
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center">
                  <TrendingUp className="h-12 w-12 text-black" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  4. Track Progress
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Monitor your growth and celebrate achievements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Everything You Need to Succeed
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6" hover>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI-Powered Planning
              </h3>
              <p className="text-gray-500">
                Get personalized roadmaps based on your unique goals and
                circumstances
              </p>
            </Card>

            <Card className="p-6" hover>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Daily Guidance
              </h3>
              <p className="text-gray-500">
                Receive manageable daily tasks that build toward your bigger
                objectives
              </p>
            </Card>

            <Card className="p-6" hover>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Progress Tracking
              </h3>
              <p className="text-gray-500">
                Monitor your growth with detailed analytics and streak counters
              </p>
            </Card>

            <Card className="p-6" hover>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Chat Support
              </h3>
              <p className="text-gray-500">
                Get instant advice and motivation from your personal AI coach
              </p>
            </Card>

            <Card className="p-6" hover>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Adaptive Plans
              </h3>
              <p className="text-gray-500">
                Plans that evolve with your progress and changing circumstances
              </p>
            </Card>

            <Card className="p-6" hover>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cross-Platform
              </h3>
              <p className="text-gray-500">
                Access your goals and tasks anywhere with responsive design
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Transform Your Life?
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-300">
            Join thousands of people already achieving their goals with
            AI-powered planning.
          </p>
          <SignUpButton
            mode="modal"
            forceRedirectUrl={isConBoarderd ? "/dashboard" : "/onboarding"}>
            <Button variant="secondary" size="lg" className="mt-8">
              Get Started Today
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
};
