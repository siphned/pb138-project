import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserInfoCard } from "../components/dashboard/UserInfoCard";
import { UserProvider, useUser } from "../context/UserContext";

// Mock the context
vi.mock("../context/UserContext", async () => {
  const actual = await vi.importActual("../context/UserContext");
  return {
    ...actual,
    useUser: vi.fn(),
  };
});

describe("UserInfoCard", () => {
  it("renders nothing when user is null", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, loading: false, refetch: vi.fn() } as any);
    const { container } = render(<UserInfoCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders user information correctly", () => {
    const mockUser = {
      fname: "John",
      lname: "Doe",
      email: "john@example.com",
    };
    vi.mocked(useUser).mockReturnValue({ user: mockUser, loading: false, refetch: vi.fn() } as any);

    render(<UserInfoCard />);

    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("john@example.com")).toBeDefined();
    expect(screen.getByText("JD")).toBeDefined(); // initials
  });
});
