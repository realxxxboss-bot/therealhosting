import { describe, expect, it } from "vitest";
import { sign, verify } from "@/lib/auth/token";

const secret = "test-secret-test-secret-test-secret";

describe("signed tokens", () => {
  it("round-trips a payload", () => {
    expect(verify<{ uid: string }>(sign({ uid: "usr_1" }, secret), secret)).toEqual({ uid: "usr_1" });
  });
  it("rejects a tampered payload", () => {
    const [, mac] = sign({ uid: "usr_1" }, secret).split(".");
    const forged = `${Buffer.from(JSON.stringify({ uid: "usr_admin" })).toString("base64url")}.${mac}`;
    expect(verify(forged, secret)).toBeNull();
  });
  it("rejects a token signed with another secret", () => {
    expect(verify(sign({ uid: "usr_1" }, "another-secret-another-secret-123"), secret)).toBeNull();
  });
  it("rejects garbage", () => {
    expect(verify(undefined, secret)).toBeNull();
    expect(verify("nodot", secret)).toBeNull();
    expect(verify("a.b", secret)).toBeNull();
  });
});
