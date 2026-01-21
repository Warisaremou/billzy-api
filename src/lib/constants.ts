// Token expiration times
export const ACCESS_TOKEN_EXPIRATION = "15m"; // 15 minutes
export const REFRESH_TOKEN_EXPIRATION = "7d"; // 7 days
export const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes in ms
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
export const CACHE_EXPIRATION_TIME = 15 * 60 * 1000; // 15 minutes
export const ACCOUNT_ACTIVATION_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

// Cookie names
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCOUNT_DEACTIVATED: "User account has been deactivated",
  ACCOUNT_ALREADY_EXISTS: "An account with this email already exists",
  ACCOUNT_NOT_FOUND: "Account not found",
  INVALID_OTP: "Invalid or expired OTP code",
  INVALID_RESET_LINK: "Invalid or expired reset link",
  INVALID_REFRESH_TOKEN: "Invalid or expired refresh token",
  INVALID_ACTIVATION_LINK: "Invalid or expired activation link",
  UNAUTHORIZED: "Unauthorized access",
  SAME_PASSWORD_POLICY_VIOLATION: "New password must be different from current password",
} as const;

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const ACCESS_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: ACCESS_COOKIE_MAX_AGE,
};

export const REFRESH_COOKIE_CONFIG = {
  ...COOKIE_CONFIG,
  maxAge: REFRESH_COOKIE_MAX_AGE,
};
