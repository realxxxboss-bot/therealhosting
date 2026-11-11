import { describe, expect, it } from "vitest";
import { apexOf, EDGE_APEX_IP, EDGE_CNAME_TARGET, requiredRecords } from "@/lib/adapters/mock/hostnames";
import { normaliseDomainQuery } from "@/lib/adapters/mock/registrar";

describe("apexOf", () => {
  it("finds the registrable domain", () => {
    expect(apexOf("www.example.com")).toBe("example.com");
    expect(apexOf("a.b.example.com")).toBe("example.com");
    expect(apexOf("shop.example.co.uk")).toBe("example.co.uk");
    expect(apexOf("example.com")).toBe("example.com");
  });
});

describe("requiredRecords", () => {
  it("uses an A record for an apex domain", () => {
    const [main, txt] = requiredRecords("example.com");
    expect(main).toMatchObject({ type: "A", name: "@", value: EDGE_APEX_IP });
    expect(txt).toMatchObject({ type: "TXT", name: "_zaffre-verify" });
  });
  it("uses a CNAME for a subdomain", () => {
    const [main, txt] = requiredRecords("shop.example.co.uk");
    expect(main).toMatchObject({ type: "CNAME", name: "shop", value: EDGE_CNAME_TARGET });
    expect(txt).toMatchObject({ name: "_zaffre-verify.shop", value: "zaffre-verify=shop.example.co.uk" });
  });
});

describe("normaliseDomainQuery", () => {
  it("cleans what people paste", () => {
    expect(normaliseDomainQuery("  https://www.Example.COM ")).toBe("example.com");
    expect(normaliseDomainQuery("my shop!.io.")).toBe("myshop.io");
  });
});
