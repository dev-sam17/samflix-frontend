import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Checks if the user is authenticated on the server side
 * @returns The auth session object if authenticated, null otherwise
 */
export async function getAuthSession() {
  return await auth();
}

/**
 * Server component function to check if a user is authenticated
 * and redirect if not
 * @param redirectUrl The URL to redirect to if not authenticated
 */
export async function requireAuth(redirectUrl: string = "/sign-in") {
  const { userId } = await auth();

  if (!userId) {
    redirect(redirectUrl);
  }

  return userId;
}

/**
 * Server component function to check if a user is unauthenticated
 * and redirect if they are already authenticated
 * @param redirectUrl The URL to redirect to if already authenticated
 */
export async function requireUnauth(redirectUrl: string = "/") {
  const { userId } = await auth();

  if (userId) {
    redirect(redirectUrl);
  }
}
