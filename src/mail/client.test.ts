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

  test("reply threads a stored message's references after the parent", async () => {
    const sent: Array<Record<string, unknown>> = [];
    (mail as unknown as { send: (r: Record<string, unknown>) => Promise<unknown> }).send = async (r) => {
      sent.push(r);
      return { id: "e1" };
    };
    const stored = {
      mailbox: "miles@mail.emptyshift.com",
      from: { email: "seller@example.org" },
      subject: "Your car",
      messageId: "<m2@x>",
      references: ["<m0@x>", "<m1@x>"],
    };
    await mail.reply(stored, { text: "Thanks" });
    const [first] = sent;
    expect(first?.references).toBe("<m0@x> <m1@x> <m2@x>");
    expect(first?.inReplyTo).toBe("<m2@x>");
    expect(first?.subject).toBe("Re: Your car");
    // A raw header string (older stored data) is split, not spread into characters.
    await mail.reply({ ...stored, references: "<m0@x> <m1@x>" as unknown as string[] }, { text: "Thanks" });
    expect(sent[1]?.references).toBe("<m0@x> <m1@x> <m2@x>");
  });
});
