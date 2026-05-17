import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminStatsSection } from "./AdminStatsSection";

vi.mock("@/generated/hooks/useGetAdminUsers", () => ({
  useGetAdminUsers: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetAdminEvents", () => ({
  useGetAdminEvents: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetAdminReviews", () => ({
  useGetAdminReviews: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetRoleRequests", () => ({
  useGetRoleRequests: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetShops", () => ({
  useGetShops: vi.fn(),
}));
vi.mock("@/generated/hooks/useGetProducts", () => ({
  useGetProducts: vi.fn(),
}));

import { useGetAdminEvents } from "@/generated/hooks/useGetAdminEvents";
import { useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";
import { useGetAdminUsers } from "@/generated/hooks/useGetAdminUsers";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetRoleRequests } from "@/generated/hooks/useGetRoleRequests";
import { useGetShops } from "@/generated/hooks/useGetShops";

function setMocks({
  users = { data: [{ id: "u1" }, { id: "u2" }, { id: "u3" }], total: 3 },
  events = { data: [{ id: "e1" }], total: 1 },
  reviews = { data: [{ id: "r1" }, { id: "r2" }], total: 2 },
  roleRequests = [{ id: "rr1" }, { id: "rr2" }, { id: "rr3" }, { id: "rr4" }],
  shops = [{ id: "s1" }, { id: "s2" }, { id: "s3" }, { id: "s4" }, { id: "s5" }],
  products = { data: [], total: 42 },
  isLoading = false,
}: {
  users?: unknown;
  events?: unknown;
  reviews?: unknown;
  roleRequests?: unknown;
  shops?: unknown;
  products?: unknown;
  isLoading?: boolean;
}) {
  vi.mocked(useGetAdminUsers).mockReturnValue({ data: users, isLoading } as any);
  vi.mocked(useGetAdminEvents).mockReturnValue({ data: events, isLoading } as any);
  vi.mocked(useGetAdminReviews).mockReturnValue({ data: reviews, isLoading } as any);
  vi.mocked(useGetRoleRequests).mockReturnValue({ data: roleRequests, isLoading } as any);
  vi.mocked(useGetShops).mockReturnValue({ data: shops, isLoading } as any);
  vi.mocked(useGetProducts).mockReturnValue({ data: products, isLoading } as any);
}

describe("AdminStatsSection", () => {
  it("renders the section heading", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText(/Platform overview/i)).toBeInTheDocument();
  });

  it("renders total users from useGetAdminUsers total", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText("Users (total)")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders pending role requests from useGetRoleRequests length", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText("Pending role requests")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders pending events from useGetAdminEvents total", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText("Pending events")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders total products from useGetProducts total", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText("Total products")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders total shops from useGetShops length", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText("Total shops")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders flagged reviews from useGetAdminReviews total", () => {
    setMocks({});
    render(<AdminStatsSection />);
    expect(screen.getByText("Flagged reviews")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows loading state while queries are pending", () => {
    setMocks({ isLoading: true });
    const { container } = render(<AdminStatsSection />);
    expect(container.querySelector('[data-slot="loading-state"]')).toBeInTheDocument();
  });
});
