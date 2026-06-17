import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";
import { EventCard } from "@/routes/-components/EventCard";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/generated/hooks/usePostEventsByIdRegister", () => ({
  usePostEventsByIdRegister: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a data-testid="link" href={to}>
      {children}
    </a>
  ),
}));

const renderWithClient = (ui: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

const mockRegister = (overrides: Partial<ReturnType<typeof usePostEventsByIdRegister>> = {}) => {
  const mutate = vi.fn();
  vi.mocked(usePostEventsByIdRegister).mockReturnValue({
    isPending: false,
    mutate,
    ...overrides,
  } as unknown as ReturnType<typeof usePostEventsByIdRegister>);
  return mutate;
};

const baseEvent = {
  id: "evt-1",
  location: "Brno, Moravia",
  // Far-future start so registration stays open in these tests regardless of when they run.
  startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  title: "Spring Wine Festival",
  winemakerName: "Lechovice",
};

describe("EventCard", () => {
  it("renders the event title as a stretched link to the detail page", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    mockRegister();
    renderWithClient(<EventCard event={baseEvent} />);
    const link = screen.getAllByTestId("link").find((el) => el.textContent === baseEvent.title);
    expect(link).toBeDefined();
    expect(link).toHaveAttribute("href", "/events/$id");
  });

  it("renders location and winemaker name in the subtitle", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    mockRegister();
    renderWithClient(<EventCard event={baseEvent} />);
    expect(screen.getByText(/Brno, Moravia/)).toBeInTheDocument();
    expect(screen.getByText(/Lechovice/)).toBeInTheDocument();
  });

  it("disables the Register button when no user is signed in", () => {
    vi.mocked(useUser).mockReturnValue({ user: null } as ReturnType<typeof useUser>);
    mockRegister();
    renderWithClient(<EventCard event={baseEvent} />);
    expect(screen.getByRole("button", { name: /register/i })).toBeDisabled();
  });

  it("shows a clickable Register button when signed in and not registered", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as unknown as ReturnType<
      typeof useUser
    >);
    const mutate = mockRegister();
    renderWithClient(<EventCard event={baseEvent} />);
    const btn = screen.getByRole("button", { name: /^register$/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(mutate).toHaveBeenCalledWith({ id: "evt-1" }, expect.anything());
  });

  it("shows a disabled Registered button when the user is already registered", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as unknown as ReturnType<
      typeof useUser
    >);
    mockRegister();
    renderWithClient(<EventCard event={{ ...baseEvent, isRegisteredByMe: true }} />);
    const btn = screen.getByRole("button", { name: /registered/i });
    expect(btn).toBeDisabled();
  });

  it("flips to a disabled Registered button when the BE returns ALREADY_REGISTERED", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as unknown as ReturnType<
      typeof useUser
    >);
    mockRegister({
      error: { response: { data: { error: { code: "ALREADY_REGISTERED" } }, status: 409 } },
    } as unknown as ReturnType<typeof usePostEventsByIdRegister>);
    renderWithClient(<EventCard event={baseEvent} />);
    const btn = screen.getByRole("button", { name: /registered/i });
    expect(btn).toBeDisabled();
  });

  it("shows a disabled 'Registration closed' button once the start date has passed", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as unknown as ReturnType<
      typeof useUser
    >);
    mockRegister();
    renderWithClient(<EventCard event={{ ...baseEvent, startTime: "2020-01-01T10:00:00Z" }} />);
    const btn = screen.getByRole("button", { name: /registration closed/i });
    expect(btn).toBeDisabled();
  });

  it("shows a friendly error message when registration is closed", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" } } as unknown as ReturnType<
      typeof useUser
    >);
    mockRegister({
      error: { response: { data: { error: { code: "EVENT_NOT_AVAILABLE" } }, status: 400 } },
    } as unknown as ReturnType<typeof usePostEventsByIdRegister>);
    renderWithClient(<EventCard event={baseEvent} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/registration closed/i);
  });
});
