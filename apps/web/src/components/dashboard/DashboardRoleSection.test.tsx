import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardRoleSection } from "./DashboardRoleSection";

vi.mock("@/context/UserContext", () => ({
  useUser: vi.fn(),
}));

vi.mock("@/generated/hooks/usePostRoleRequests", () => ({
  usePostRoleRequests: vi.fn(),
}));

import { useUser } from "@/context/UserContext";
import { usePostRoleRequests } from "@/generated/hooks/usePostRoleRequests";

type MutationLike = {
  mutate: ReturnType<typeof vi.fn>;
  isPending: boolean;
  isSuccess: boolean;
  error: unknown;
};

const baseUser = {
  activeRole: "Customer",
  isLoading: false,
  setActiveRole: vi.fn(),
  updateUser: vi.fn(),
};

const mockUser = (roles: string[]) => ({
  ...baseUser,
  user: {
    clerkId: "clerk_1",
    email: "a@b.com",
    fname: "Adam",
    id: "u1",
    lname: "M",
    roles,
  },
});

const mockMutation = (overrides: Partial<MutationLike> = {}): MutationLike => ({
  error: null,
  isPending: false,
  isSuccess: false,
  mutate: vi.fn(),
  ...overrides,
});

describe("DashboardRoleSection", () => {
  it("renders nothing when user is not loaded", () => {
    vi.mocked(useUser).mockReturnValue({ ...baseUser, user: null } as ReturnType<typeof useUser>);
    vi.mocked(usePostRoleRequests).mockReturnValue(
      mockMutation() as unknown as ReturnType<typeof usePostRoleRequests>
    );
    const { container } = render(<DashboardRoleSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a badge for each current role", () => {
    vi.mocked(useUser).mockReturnValue(
      mockUser(["Customer", "Winemaker"]) as ReturnType<typeof useUser>
    );
    vi.mocked(usePostRoleRequests).mockReturnValue(
      mockMutation() as unknown as ReturnType<typeof usePostRoleRequests>
    );
    render(<DashboardRoleSection />);
    expect(screen.getByText("Customer")).toBeInTheDocument();
    expect(screen.getByText("Winemaker")).toBeInTheDocument();
  });

  it("renders the request form fields", () => {
    vi.mocked(useUser).mockReturnValue(mockUser(["Customer"]) as ReturnType<typeof useUser>);
    vi.mocked(usePostRoleRequests).mockReturnValue(
      mockMutation() as unknown as ReturnType<typeof usePostRoleRequests>
    );
    render(<DashboardRoleSection />);
    expect(screen.getByLabelText(/business name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /request/i })).toBeInTheDocument();
  });

  it("calls the mutation with the form data on submit", async () => {
    const mutate = vi.fn();
    vi.mocked(useUser).mockReturnValue(mockUser(["Customer"]) as ReturnType<typeof useUser>);
    vi.mocked(usePostRoleRequests).mockReturnValue(
      mockMutation({ mutate }) as unknown as ReturnType<typeof usePostRoleRequests>
    );
    render(<DashboardRoleSection />);
    fireEvent.change(screen.getByLabelText(/business name/i), {
      target: { value: "Acme Winery" },
    });
    fireEvent.click(screen.getByRole("button", { name: /request/i }));
    await waitFor(() => {
      expect(mutate).toHaveBeenCalledWith({
        data: {
          businessName: "Acme Winery",
          type: "winemaker",
        },
      });
    });
  });

  it("shows a success message after the mutation succeeds", () => {
    vi.mocked(useUser).mockReturnValue(mockUser(["Customer"]) as ReturnType<typeof useUser>);
    vi.mocked(usePostRoleRequests).mockReturnValue(
      mockMutation({ isSuccess: true }) as unknown as ReturnType<typeof usePostRoleRequests>
    );
    render(<DashboardRoleSection />);
    expect(screen.getByText(/awaiting admin approval/i)).toBeInTheDocument();
  });

  it("shows a 'pending request' message when the API returns 409", () => {
    vi.mocked(useUser).mockReturnValue(mockUser(["Customer"]) as ReturnType<typeof useUser>);
    vi.mocked(usePostRoleRequests).mockReturnValue(
      mockMutation({
        error: { response: { status: 409 } },
      }) as unknown as ReturnType<typeof usePostRoleRequests>
    );
    render(<DashboardRoleSection />);
    expect(screen.getByText(/already have a pending request/i)).toBeInTheDocument();
  });
});
