import type { ActionCodeSettings } from "firebase/auth";

/**
 * Firebase action links (verification, password reset) must redirect to an
 * authorized domain. Uses the live browser origin on the client so Vercel
 * deployments work without rebuilding when the URL changes.
 */
export function getActionCodeSettings(path = "/dashboard"): ActionCodeSettings {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    url: `${baseUrl}${path}`,
    handleCodeInApp: false,
  };
}
