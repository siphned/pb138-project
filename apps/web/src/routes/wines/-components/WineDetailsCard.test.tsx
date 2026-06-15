import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WineDetailsCard } from "@/routes/wines/-components/WineDetailsCard";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockWine = {
  alcoholContent: "12.5",
  color: "white",
  description: "A fine white wine.",
  id: "wine-1",
  name: "Chardonnay",
  region: "Moravia",
  vintageYear: 2022,
  winemaker: { id: "wm-1", name: "Lechovice", userId: "user-1" },
} as any;

describe("WineDetailsCard", () => {
  it("renders wine details", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <WineDetailsCard wine={mockWine} />
      </QueryClientProvider>
    );
    expect(screen.getByText("About this wine")).toBeInTheDocument();
    expect(screen.getByText("A fine white wine.")).toBeInTheDocument();
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("links the winemaker name", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <WineDetailsCard wine={mockWine} />
      </QueryClientProvider>
    );
    expect(screen.getByText("Lechovice")).toBeInTheDocument();
  });
});
