// app/api/send-alert/__tests__/route.test.ts
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/send-alert/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/send-alert", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/send-alert", () => {
  it("returns simulated:true for a valid patient id", async () => {
    const res = await POST(
      makeRequest({ patient_id: "p-001", subject: "x", body: "y" })
    );
    const json = await res.json();
    expect(json.simulated).toBe(true);
    expect(json.preview.subject).toBe("x");
    expect(json.preview.body).toBe("y");
    expect(json.preview.to).toContain("@");
  });

  it("returns 404 for an unknown patient id", async () => {
    const res = await POST(
      makeRequest({ patient_id: "nope", subject: "x", body: "y" })
    );
    expect(res.status).toBe(404);
  });
});
