import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

const mockMutateAsync = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/generated/users/users", () => ({
  getGetUsersMeQueryKey: () => ["users", "me"],
  getGetUsersMeQueryOptions: () => ({ queryKey: ["users", "me"] }),
  usePutUsersMe: () => ({ mutateAsync: mockMutateAsync }),
}));

import { useQuery } from "@tanstack/react-query";
import { UserProvider, useUser } from "../context/UserContext";

function UserDisplay() {
  const { user, isLoading, updateUser } = useUser();
  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>No user</p>;
  return (
    <div>
      <p data-testid="fname">{user.fname}</p>
      <p data-testid="roles">{user.roles.join(",")}</p>
      <button onClick={() => updateUser({ fname: "Updated" })} type="button">
        Update
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <UserProvider>
      <UserDisplay />
    </UserProvider>
  );
}

describe("UserContext", () => {
  it("shows loading state while fetching", () => {
    vi.mocked(useQuery).mockReturnValue({ data: undefined, isLoading: true } as never);
    renderWithProvider();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows 'No user' when query returns nothing", () => {
    vi.mocked(useQuery).mockReturnValue({ data: undefined, isLoading: false } as never);
    renderWithProvider();
    expect(screen.getByText("No user")).toBeInTheDocument();
  });

  it("renders user fname and roles from API", async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        clerkId: "clerk_1",
        email: "jan@test.cz",
        fname: "Jan",
        id: "1",
        lname: "Novák",
        roles: ["customer", "winemaker"],
      },
      isLoading: false,
    } as never);
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("fname")).toHaveTextContent("Jan");
      expect(screen.getByTestId("roles")).toHaveTextContent("customer,winemaker");
    });
  });

  it("defaults roles to empty array when API returns undefined roles", async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: {
        clerkId: "clerk_1",
        email: "jan@test.cz",
        fname: "Jan",
        id: "1",
        lname: "Novák",
        roles: undefined,
      },
      isLoading: false,
    } as never);
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("roles")).toHaveTextContent("");
    });
  });

  it("calls mutateAsync when updateUser is invoked", async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({
      clerkId: "clerk_1",
      email: "jan@test.cz",
      fname: "Updated",
      id: "1",
      lname: "Novák",
      roles: ["customer"],
    });
    vi.mocked(useQuery).mockReturnValue({
      data: {
        clerkId: "clerk_1",
        email: "jan@test.cz",
        fname: "Jan",
        id: "1",
        lname: "Novák",
        roles: ["customer"],
      },
      isLoading: false,
    } as never);
    renderWithProvider();
    await waitFor(() => screen.getByText("Update"));
    await user.click(screen.getByText("Update"));
    expect(mockMutateAsync).toHaveBeenCalledWith({ data: { fname: "Updated" } });
  });

  it("updateUser returns a UserProfile shape (not raw API response)", async () => {
    const user = userEvent.setup();
    const rawApiResponse = {
      clerkId: "clerk_1",
      // raw API might have extra fields we don't care about
      createdAt: "2026-01-01",
      email: "jan@test.cz",
      fname: "Updated",
      id: "1",
      lname: "Novák",
      roles: ["customer"],
    };
    mockMutateAsync.mockResolvedValue(rawApiResponse);
    vi.mocked(useQuery).mockReturnValue({
      data: { ...rawApiResponse, fname: "Jan" },
      isLoading: false,
    } as never);

    let returnValue: unknown;
    function Tester() {
      const { updateUser } = useUser();
      return (
        <button
          onClick={async () => {
            returnValue = await updateUser({ fname: "Updated" });
          }}
          type="button"
        >
          Update
        </button>
      );
    }
    render(
      <UserProvider>
        <Tester />
      </UserProvider>
    );
    await user.click(screen.getByText("Update"));
    await waitFor(() => {
      expect(returnValue).toMatchObject({
        clerkId: "clerk_1",
        email: "jan@test.cz",
        fname: "Updated",
        id: "1",
        lname: "Novák",
        roles: ["customer"],
      });
      // must not have extra raw fields
      expect(returnValue).not.toHaveProperty("createdAt");
    });
  });
});
