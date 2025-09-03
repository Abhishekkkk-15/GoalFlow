import { useUser } from '@clerk/clerk-react';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  
  return {
    user,
    isLoaded,
    isSignedIn
  };
};