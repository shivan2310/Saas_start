type FirebaseAuthError = {
  code?: string;
  message?: string;
};

export function getAuthErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const authError = error as FirebaseAuthError;

  switch (authError.code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";
    case "auth/weak-password":
      return "Password should be at least 8 characters.";
    case "auth/unauthorized-continue-uri":
      return "This site domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
    case "auth/invalid-continue-uri":
      return "Invalid redirect URL configured for auth emails. Check NEXT_PUBLIC_APP_URL on Vercel.";
    case "auth/too-many-requests":
      return "Too many requests. Wait a few minutes, then try again.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    default:
      return authError.message || fallback;
  }
}
