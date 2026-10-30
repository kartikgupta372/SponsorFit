/** Small, reusable form validators. Messages say what to do, never blame the user. */

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
    return "That email looks incomplete. Try something like name@example.com.";
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return "Enter a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return "Tell us what to call you.";
  return undefined;
}
