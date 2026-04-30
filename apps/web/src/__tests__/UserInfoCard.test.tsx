import { useClerk } from "@clerk/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UserInfoCard } from "../components/dashboard/UserInfoCard";

vi.mock("@clerk/react", () => ({
  useClerk: vi.fn(),
}));

vi.mock("../context/UserContext", () => ({
  useUser: vi.fn(),
}));

// Mock Dialog to avoid potential issues with Radix UI
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ render }: { render: React.ReactNode }) => <div>{render}</div>,
}));

// Mock ProfileEditForm
vi.mock("../components/dashboard/ProfileEditForm", () => ({
  ProfileEditForm: () => <div>ProfileEditForm</div>,
}));

describe("UserInfoCard", () => {
  it("renders default 'User' when clerk user is null", () => {
    vi.mocked(useClerk).mockReturnValue({
      user: null,
    } as any);

    render(<UserInfoCard />);
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("renders user information correctly", () => {
    vi.mocked(useClerk).mockReturnValue({
      user: {
        emailAddresses: [{ emailAddress: "john@example.com" }],
        firstName: "John",
        fullName: "John Doe",
        imageUrl: "http://example.com/image.jpg",
        lastName: "Doe",
      },
    } as any);

    render(<UserInfoCard />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("JO")).toBeInTheDocument(); // initials
  });
});
