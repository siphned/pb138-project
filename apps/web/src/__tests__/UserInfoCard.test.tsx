import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/react", () => ({
  useClerk: vi.fn(),
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  AvatarImage: () => null,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ render: r }: { render: React.ReactNode }) => <div>{r}</div>,
}));

vi.mock("./ProfileEditForm", () => ({
  ProfileEditForm: () => null,
}));

vi.mock("../components/dashboard/ProfileEditForm", () => ({
  ProfileEditForm: () => null,
}));

import { useClerk } from "@clerk/react";
import { UserInfoCard } from "../components/dashboard/UserInfoCard";

describe("UserInfoCard", () => {
  it("renders user full name and email from Clerk", () => {
    vi.mocked(useClerk).mockReturnValue({
      user: {
        emailAddresses: [{ emailAddress: "john@example.com" }],
        firstName: "John",
        fullName: "John Doe",
        imageUrl: "",
        lastName: "Doe",
      },
    } as never);

    render(<UserInfoCard />);

    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("john@example.com")).toBeDefined();
    expect(screen.getByText("JO")).toBeDefined(); // initials
  });

  it("renders fallback when clerk user has no name", () => {
    vi.mocked(useClerk).mockReturnValue({
      user: {
        emailAddresses: [],
        firstName: "",
        fullName: "",
        imageUrl: "",
        lastName: "",
      },
    } as never);

    render(<UserInfoCard />);
    expect(screen.getByText("User")).toBeDefined();
  });
});
