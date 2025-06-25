"use client";

import { useAuthContext } from "@/contexts/auth-context";

/**
 * Custom hook to access authentication state and methods
 *
 * @returns {Object} Authentication state and methods
 * @returns {boolean} isAuthenticated - Whether the user is authenticated
 * @returns {boolean} isLoading - Whether the authentication state is still loading
 * @returns {string|null} userId - The ID of the authenticated user, or null if not authenticated
 * @returns {Object|null} user - The user object from Clerk, or null if not authenticated
 */
export function useAuth() {
  const auth = useAuthContext();

  return {
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    userId: auth.userId,
    user: auth.user,
  };
}
