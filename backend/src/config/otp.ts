// ============================================================
// OTP Configuration Constants
// ============================================================

/** Number of digits in the OTP */
export const OTP_LENGTH = 6;

/** OTP validity window in minutes */
export const OTP_EXPIRY_MINUTES = 5;

/** OTP validity in milliseconds */
export const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;

/** Maximum failed verification attempts before OTP is invalidated */
export const OTP_MAX_ATTEMPTS = 5;

/** Minimum seconds to wait before requesting a new OTP (cooldown) */
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

/** Bcrypt salt rounds for OTP hashing */
export const OTP_BCRYPT_ROUNDS = 10;

/** OTP purpose strings */
export const OTP_PURPOSE = {
  REGISTER: 'REGISTER',
  LOGIN: 'LOGIN',
  VERIFY: 'VERIFY',
} as const;

export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];
