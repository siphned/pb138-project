import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useUser } from "@/context/UserContext";
import { useDeleteEventsByIdRegister } from "@/generated/hooks/useDeleteEventsByIdRegister";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";
import { EventRegistrationButton } from "./EventRegistrationButton";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/generated/hooks/usePostEventsByIdRegister", () => ({
  usePostEventsByIdRegister: vi.fn(),
}));

vi.mock("@/generated/hooks/useDeleteEventsByIdRegister", () => ({
  useDeleteEventsByIdRegister: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

const mockRegister = (overrides: Partial<ReturnType<typeof usePostEventsByIdRegister>> = {}) => {
  const mutate = vi.fn();
  vi.mocked(usePostEventsByIdRegister).mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as any);
  return mutate;
};

const mockCancel = (overrides: Partial<ReturnType<typeof useDeleteEventsByIdRegister>> = {}) => {
  const mutate = vi.fn();
  vi.mocked(useDeleteEventsByIdRegister).mockReturnValue({
    mutate,
    isPending: false,
    ...overrides,
  } as any);
  return mutate;
};

describe("EventRegistrationButton", () => {
  it("renders 'Sign in to register' when no user is signed in", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: false } as any);
    mockRegister();
    mockCancel();
    render(<EventRegistrationButton eventId="evt-1" />);
    expect(screen.getByRole("link")).toHaveTextContent(/sign in to register/i);
  });

  it("renders 'Register' when signed in but not registered", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" }, isLoading: false } as any);
    mockRegister();
    mockCancel();
    render(<EventRegistrationButton eventId="evt-1" isRegistered={false} />);
    expect(screen.getByRole("button")).toHaveTextContent(/register/i);
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
  });

  it("renders 'Cancel registration' when signed in and already registered", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" }, isLoading: false } as any);
    mockRegister();
    mockCancel();
    render(<EventRegistrationButton eventId="evt-1" isRegistered={true} />);
    expect(screen.getByRole("button")).toHaveTextContent(/cancel registration/i);
  });

  it("fires the register mutation on Register click", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" }, isLoading: false } as any);
    const mutate = mockRegister();
    mockCancel();
    render(<EventRegistrationButton eventId="evt-1" isRegistered={false} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mutate).toHaveBeenCalledWith({ id: "evt-1" });
  });

  it("fires the cancel mutation on Cancel click", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" }, isLoading: false } as any);
    mockRegister();
    const mutate = mockCancel();
    render(<EventRegistrationButton eventId="evt-1" isRegistered={true} />);
    fireEvent.click(screen.getByRole("button"));
    expect(mutate).toHaveBeenCalledWith({ id: "evt-1" });
  });

  it("disables the button while the register mutation is pending", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" }, isLoading: false } as any);
    mockRegister({ isPending: true } as any);
    mockCancel();
    render(<EventRegistrationButton eventId="evt-1" isRegistered={false} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/registering/i);
  });

  it("disables the button while the cancel mutation is pending", () => {
    vi.mocked(useUser).mockReturnValue({ user: { id: "u-1" }, isLoading: false } as any);
    mockRegister();
    mockCancel({ isPending: true } as any);
    render(<EventRegistrationButton eventId="evt-1" isRegistered={true} />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/cancelling/i);
  });
});
