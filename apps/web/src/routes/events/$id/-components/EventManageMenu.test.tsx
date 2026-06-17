import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventManageMenu } from "@/routes/events/$id/-components/EventManageMenu";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, params }: any) => (
    <a data-testid="link" href={`${to}/${params?.id ?? ""}`}>
      {children}
    </a>
  ),
}));

describe("EventManageMenu", () => {
  it("renders nothing when canManage is false", () => {
    const { container } = render(<EventManageMenu canManage={false} eventId="evt-1" />);
    expect(container.textContent ?? "").not.toMatch(/manage/i);
  });

  it("renders the manage trigger when canManage is true", () => {
    render(<EventManageMenu canManage eventId="evt-1" />);
    expect(screen.getByRole("button", { name: /manage event/i })).toBeInTheDocument();
  });
});
