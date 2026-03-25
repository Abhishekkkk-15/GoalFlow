import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Layout } from "./components/layout/Layout";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Plan } from "./pages/Plan";
import { Chat } from "./pages/Chat";
import { Profile } from "./pages/Profile";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <SignedIn>{children}</SignedIn>;
};

// Check if user has completed onboarding (mock implementation)
const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // In a real app, this would check if user has completed onboarding
  const hasCompletedOnboarding =
    localStorage.getItem("onboarding-completed") === "true";

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        elements: {
          formButtonPrimary: "bg-black hover:bg-gray-800 text-white",
          card: "shadow-none border border-gray-200",
        },
      }}
      redirectUrl={"/dashboard"}>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <SignedOut>
                  <Landing />
                </SignedOut>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Dashboard />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/plan"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Plan />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <OnboardingCheck>
                    <Chat />
                  </OnboardingCheck>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Redirect signed in users from home to dashboard */}
            <Route
              path="/"
              element={
                <SignedIn>
                  <Navigate to="/dashboard" replace />
                </SignedIn>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </ClerkProvider>
  );
}

export default App;
