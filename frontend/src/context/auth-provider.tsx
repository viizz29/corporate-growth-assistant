import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useProfileQuery, useLogoutMutation } from "@/hooks/use-auth-queries";
import type { UserProfileInfo } from "@/api/auth-api";

type AuthContextType = {
  user: UserProfileInfo | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isAuthReady: boolean;
  logout: () => void;
  updateProfile: (profile: UserProfileInfo) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfileInfo | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const profileQuery = useProfileQuery();
  const logoutMutation = useLogoutMutation();

  const updateProfile = useCallback((profile: UserProfileInfo) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : null));
  }, []);

  const logout = useCallback(() => {
    logoutMutation.mutate(undefined, {
      onSettled: () => setUser(null),
    });
  }, [logoutMutation]);

  useEffect(() => {
    if (profileQuery.isFetched) {
      if (profileQuery.data) {
        setUser(profileQuery.data);
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    }
  }, [profileQuery.isFetched, profileQuery.data]);

  return (
    isAuthReady ? (
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          isEmailVerified: !!user?.isEmailVerified,
          isAuthReady,
          logout,
          updateProfile,
        }}
      >
        {children}
      </AuthContext.Provider>
    ) : (
      <div>Checking login info ...</div>
    )
  );
};
