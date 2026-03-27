import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SignOutButton } from '@clerk/clerk-react';
import { 
  Home, 
  Target, 
  MessageCircle, 
  User, 
  LogOut,
  Menu,
  X,
  LineChart,
  Settings2
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Plan', href: '/plan', icon: Target },
  { name: 'AI Chat', href: '/chat', icon: MessageCircle },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Preferences', href: '/preferences', icon: Settings2 },
];

export const Navigation: React.FC = () => {
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!isSignedIn) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-grow pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6">
            <h1 className="text-xl font-bold text-black">GoalFlow</h1>
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
            <SignOutButton>
              <button className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </SignOutButton>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-xl font-bold text-black">GoalFlow</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
              <SignOutButton>
                <button className="group flex items-center w-full px-3 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </SignOutButton>
            </nav>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
          <nav className="flex justify-around">
            {navigationItems.slice(0, 4).map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex flex-col items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'text-black'
                      : 'text-gray-500'
                  }`
                }
              >
                <item.icon className={`h-5 w-5 mb-1 ${location.pathname === item.href ? 'text-black' : 'text-gray-400'}`} />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};