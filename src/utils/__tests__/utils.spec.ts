import * as bcrypt from "bcrypt";
import { generateHash, generateOTP, generateUrlToken } from "../index";

describe("Utils", () => {
  describe("generateOTP", () => {
    it("should generate a 6-digit OTP by default", () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^\d{6}$/);
    });

    it("should generate an OTP with custom length", () => {
      const otp = generateOTP(4);
      expect(otp).toHaveLength(4);
      expect(otp).toMatch(/^\d{4}$/);
    });

    it("should generate an 8-digit OTP when length is 8", () => {
      const otp = generateOTP(8);
      expect(otp).toHaveLength(8);
      expect(otp).toMatch(/^\d{8}$/);
    });

    it("should generate only numeric characters", () => {
      const otp = generateOTP(10);
      const containsOnlyDigits = /^\d+$/.test(otp);
      expect(containsOnlyDigits).toBe(true);
    });

    it("should generate different OTPs on consecutive calls", () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      const otp3 = generateOTP();

      // At least one should be different (extremely unlikely all 3 are the same)
      const allSame = otp1 === otp2 && otp2 === otp3;
      expect(allSame).toBe(false);
    });
  });

  describe("generateHash", () => {
    it("should generate a bcrypt hash", async () => {
      const value = "password123";
      const hash = await generateHash(value);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(value);
    });

    it("should generate a valid bcrypt hash that can be verified", async () => {
      const value = "mySecurePassword";
      const hash = await generateHash(value);

      const isValid = await bcrypt.compare(value, hash);
      expect(isValid).toBe(true);
    });

    it("should generate different hashes for the same input (salt)", async () => {
      const value = "samePassword";
      const hash1 = await generateHash(value);
      const hash2 = await generateHash(value);

      expect(hash1).not.toBe(hash2);
      // But both should be valid
      expect(await bcrypt.compare(value, hash1)).toBe(true);
      expect(await bcrypt.compare(value, hash2)).toBe(true);
    });

    it("should not match incorrect password", async () => {
      const correctPassword = "correctPassword";
      const wrongPassword = "wrongPassword";
      const hash = await generateHash(correctPassword);

      const isValid = await bcrypt.compare(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should handle empty string", async () => {
      const hash = await generateHash("");
      expect(hash).toBeDefined();
      expect(await bcrypt.compare("", hash)).toBe(true);
    });
  });

  describe("generateUrlToken", () => {
    it("should generate a URL-safe token", () => {
      const token = generateUrlToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token).not.toMatch(/[+/]/);
    });

    it("should generate tokens of expected length", () => {
      const token = generateUrlToken();
      expect(token.length).toBe(128);
    });

    it("should generate different tokens on consecutive calls", () => {
      const token1 = generateUrlToken();
      const token2 = generateUrlToken();

      expect(token1).not.toBe(token2);
    });
  });
});
