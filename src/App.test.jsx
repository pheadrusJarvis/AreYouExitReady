import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";

describe("App", () => {
  it("renders without crashing", () => {
    const html = renderToString(<App />);
    expect(html.length).toBeGreaterThan(0);
  });
});
