import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileEditForm } from "../components/dashboard/ProfileEditForm";
import { useUser } from "../context/UserContext";

// Mock the context
vi.mock("../context/UserContext", () => ({
  useUser: vi.fn(),
}));

describe("ProfileEditForm", () => {
  const mockUpdateUser = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUser).mockReturnValue({
      user: { fname: "John", lname: "Doe" },
      updateUser: mockUpdateUser,
      loading: false,
      refetch: vi.fn(),
    } as any);
  });

  it("renders with initial user data", () => {
    render(<ProfileEditForm />);
    expect(screen.getByPlaceholderText("John")).toBeDefined();
    expect(screen.getByPlaceholderText("Doe")).toBeDefined();
  });

  it("shows validation errors for empty fields", async () => {
    render(<ProfileEditForm />);

    // Clear fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "" } });

    fireEvent.click(screen.getByText("Save Changes"));

    expect(await screen.findByText("First name is required")).toBeDefined();
    expect(await screen.findByText("Last name is required")).toBeDefined();
  });

  it("calls updateUser and onSuccess on valid submission", async () => {
    render(<ProfileEditForm onSuccess={mockOnSuccess} />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ fname: "Jane", lname: "Doe" });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<ProfileEditForm onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
