type AuthError = { code?: string; message?: string };
export function getAuthErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const authError = error as AuthError;
  if (authError.code === "user_already_exists" || /already registered/i.test(authError.message || "")) return "An account already exists with this email.";
  if (authError.code === "weak_password") return "Password should be at least 8 characters.";
  if (authError.code === "over_request_rate_limit") return "Too many requests. Wait a few minutes, then try again.";
  if (authError.code === "invalid_credentials") return "Invalid email or password.";
  return fallback;
}
