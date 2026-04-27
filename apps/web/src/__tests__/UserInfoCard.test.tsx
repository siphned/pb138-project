import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserInfoCard } from "../components/dashboard/UserInfoCard";
import { useUser } from "../context/UserContext";

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
    vi.mocked(useUser).mockReturnValue({ loading: false, refetch: vi.fn(), user: null } as never);
    const { container } = render(<UserInfoCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders user information correctly", () => {
    const mockUser = {
      email: "john@example.com",
      fname: "John",
      lname: "Doe",
    };
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      refetch: vi.fn(),
      user: mockUser,
    } as never);

    render(<UserInfoCard />);

    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("john@example.com")).toBeDefined();
    expect(screen.getByText("JD")).toBeDefined(); // initials
  });
});
