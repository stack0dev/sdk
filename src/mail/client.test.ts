/**
 * Tests for Mail client
 */

import { describe, test, expect, beforeEach } from "bun:test";
import { Mail } from "./client";

describe("Mail Client", () => {
  let mail: Mail;

  beforeEach(() => {
    mail = new Mail({
      apiKey: "stack0_mail_test_key",
      baseUrl: "http://localhost:3002/v1",
    });
  });

  test("should create mail client", () => {
    expect(mail).toBeDefined();
    expect(mail.send).toBeDefined();
    expect(mail.get).toBeDefined();
  });

  test("send method should exist", () => {
    expect(typeof mail.send).toBe("function");
  });

  test("get method should exist", () => {
    expect(typeof mail.get).toBe("function");
  });
});
