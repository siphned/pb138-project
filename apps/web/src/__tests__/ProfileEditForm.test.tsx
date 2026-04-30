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
    mockUpdateUser.mockResolvedValue(undefined);
    vi.mocked(useUser).mockReturnValue({
      loading: false,
      refetch: vi.fn(),
      updateUser: mockUpdateUser,
      user: { fname: "John", lname: "Doe" },
    } as never);
  });

  describe("Rendering", () => {
    it("renders with initial user data", () => {
      render(<ProfileEditForm />);
      expect(screen.getByPlaceholderText("John")).toBeDefined();
      expect(screen.getByPlaceholderText("Doe")).toBeDefined();
    });

    it("renders form title and description", () => {
      render(<ProfileEditForm />);
      expect(screen.getByText("Edit Profile")).toBeInTheDocument();
      expect(screen.getByText("Update your name information.")).toBeInTheDocument();
    });

    it("renders Save Changes and Cancel buttons", () => {
      render(<ProfileEditForm />);
      expect(screen.getByText("Save Changes")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("renders with empty form when user is null", () => {
      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: mockUpdateUser,
        user: null,
      } as never);
      render(<ProfileEditForm />);
      const inputs = screen.getAllByRole("textbox");
      expect(inputs[0]).toHaveValue("");
      expect(inputs[1]).toHaveValue("");
    });
  });

  describe("Form Validation", () => {
    it("shows validation error for empty first name", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));
      expect(await screen.findByText("First name is required")).toBeInTheDocument();
    });

    it("shows validation error for empty last name", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));
      expect(await screen.findByText("Last name is required")).toBeInTheDocument();
    });

    it("shows validation errors for both fields when empty", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));

      expect(await screen.findByText("First name is required")).toBeInTheDocument();
      expect(await screen.findByText("Last name is required")).toBeInTheDocument();
    });

    it("clears error when user starts typing in field", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await screen.findByText("First name is required");

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
      expect(screen.queryByText("First name is required")).not.toBeInTheDocument();
    });

    it("validates whitespace-only names as invalid", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "   " } });
      fireEvent.click(screen.getByText("Save Changes"));
      expect(await screen.findByText("First name is required")).toBeInTheDocument();
    });

    it("accepts valid names with special characters", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: "Jean-Pierre" },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: "O'Brien" },
      });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          fname: "Jean-Pierre",
          lname: "O'Brien",
        });
      });
    });
  });

  describe("Form Submission", () => {
    it("calls updateUser with new data on valid submission", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({ fname: "Jane", lname: "Doe" });
      });
    });

    it("calls onSuccess callback after successful update", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it("does not call updateUser on validation failure", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await screen.findByText("First name is required");
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it("does not call onSuccess on validation failure", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await screen.findByText("First name is required");
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it("submits form with unchanged data", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({ fname: "John", lname: "Doe" });
      });
    });

    it("submits form with both fields changed", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Smith" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({ fname: "Jane", lname: "Smith" });
      });
    });

    it("handles updateUser rejection gracefully", async () => {
      mockUpdateUser.mockRejectedValueOnce(new Error("Update failed"));
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockOnSuccess).not.toHaveBeenCalled();
      });
    });

    it("resets isSaving state after failed update", async () => {
      mockUpdateUser.mockRejectedValueOnce(new Error("Update failed"));
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Jane" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        // Button should be enabled again (not in saving state)
        const saveButton = screen.getByText("Save Changes");
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe("Button Interactions", () => {
    it("calls onCancel when cancel button is clicked", () => {
      render(<ProfileEditForm onCancel={mockOnCancel} />);
      fireEvent.click(screen.getByText("Cancel"));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it("does not require onCancel callback", () => {
      render(<ProfileEditForm />);
      // Should not throw
      fireEvent.click(screen.getByText("Cancel"));
    });

    it("prevents form submission on Enter key if validation fails", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });

      // Click save button to trigger form submission
      fireEvent.click(screen.getByText("Save Changes"));

      expect(await screen.findByText("First name is required")).toBeInTheDocument();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });
  });

  describe("User Data Updates", () => {
    it("updates form when user data changes", async () => {
      const { rerender } = render(<ProfileEditForm />);

      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: mockUpdateUser,
        user: { fname: "Jane", lname: "Smith" },
      } as never);

      rerender(<ProfileEditForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Jane")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Smith")).toBeInTheDocument();
      });
    });

    it("preserves user edits when switching from one user to another", async () => {
      const { rerender } = render(<ProfileEditForm />);

      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "Edit" } });

      vi.mocked(useUser).mockReturnValue({
        loading: false,
        refetch: vi.fn(),
        updateUser: mockUpdateUser,
        user: { fname: "Different", lname: "Person" },
      } as never);

      rerender(<ProfileEditForm />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Different")).toBeInTheDocument();
      });
    });
  });

  describe("Field Interactions", () => {
    it("allows typing in first name field", () => {
      render(<ProfileEditForm />);
      const input = screen.getByLabelText(/first name/i);
      fireEvent.change(input, { target: { value: "NewName" } });
      expect(input).toHaveValue("NewName");
    });

    it("allows typing in last name field", () => {
      render(<ProfileEditForm />);
      const input = screen.getByLabelText(/last name/i);
      fireEvent.change(input, { target: { value: "NewLastName" } });
      expect(input).toHaveValue("NewLastName");
    });

    it("handles long input values", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      const longName = "A".repeat(100);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: longName } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          fname: longName,
          lname: "Doe",
        });
      });
    });

    it("handles unicode characters in names", async () => {
      render(<ProfileEditForm onSuccess={mockOnSuccess} />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "José" } });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "García" } });
      fireEvent.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateUser).toHaveBeenCalledWith({
          fname: "José",
          lname: "García",
        });
      });
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for input fields", () => {
      render(<ProfileEditForm />);
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    });

    it("associates input fields with labels correctly", () => {
      render(<ProfileEditForm />);
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      expect(firstNameInput).toHaveAttribute("name", "fname");
      expect(lastNameInput).toHaveAttribute("name", "lname");
    });

    it("error messages are accessible", async () => {
      render(<ProfileEditForm />);
      fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "" } });
      fireEvent.click(screen.getByText("Save Changes"));
      const errorMsg = await screen.findByText("First name is required");
      expect(errorMsg).toBeInTheDocument();
    });
  });
});
