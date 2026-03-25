import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { User, Mail, Calendar, AlertTriangle } from "lucide-react";

export const Profile: React.FC = () => {
  const { user } = useUser();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteData = async () => {
    setDeleting(true);
    // Simulate API call to delete user data
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setDeleting(false);
    setShowDeleteConfirm(false);
    // In a real app, this would clear user data and potentially redirect
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="relative">
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-gray-600">
              <User className="h-5 w-5 mr-3" />
              <span>
                Name: {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="h-5 w-5 mr-3" />
              <span>Email: {user.emailAddresses[0]?.emailAddress}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3" />
              <span>
                Joined: {new Date(user.createdAt!).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Management
          </h3>

          <div className="space-y-4">
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-yellow-800">
                    Reset Progress Data
                  </h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    This will permanently delete all your goals, tasks, and
                    progress data. This action cannot be undone.
                  </p>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                      Reset Data
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-yellow-800">
                        Are you sure? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleDeleteData}
                          loading={deleting}
                          className="bg-red-600 hover:bg-red-700 text-white">
                          Yes, Delete All Data
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Usage Statistics */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Usage Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">7</div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">42</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
