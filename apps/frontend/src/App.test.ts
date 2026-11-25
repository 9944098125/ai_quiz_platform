import { describe, expect, it } from "vitest";
import App from "./App.tsx";

describe("frontend smoke test", () => {
  it("exports the root App component", () => {
    expect(typeof App).toBe("function");
  });
});
