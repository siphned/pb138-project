import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { WineDetailsCard } from "./WineDetailsCard";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock("@/generated/hooks/useGetWinemakersMe", () => ({
  useGetWinemakersMe: vi.fn(),
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetWinemakersMe).mockReturnValue({ data: null, isLoading: false } as any);
  });

  it("renders wine details", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as any);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <WineDetailsCard wine={mockWine} />
      </QueryClientProvider>
    );
    expect(screen.getByText("About this wine")).toBeInTheDocument();
    expect(screen.getByText("A fine white wine.")).toBeInTheDocument();
    expect(screen.getByText("12.5%")).toBeInTheDocument();
  });

  it("shows owner actions when user is winemaker", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "user-1" } } as any);
    vi.mocked(useGetWinemakersMe).mockReturnValue({
      data: { id: "wm-1" },
      isLoading: false,
    } as any);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <WineDetailsCard wine={mockWine} />
      </QueryClientProvider>
    );
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
  });

  it("hides owner actions when user is NOT winemaker", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "user-2" } } as any);
    vi.mocked(useGetWinemakersMe).mockReturnValue({
      data: { id: "wm-2" },
      isLoading: false,
    } as any);
    render(
      <QueryClientProvider client={new QueryClient()}>
        <WineDetailsCard wine={mockWine} />
      </QueryClientProvider>
    );
    expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
  });
});
