import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  EventApprovalData,
  OrderConfirmationData,
  OrderStatusData,
  RoleRequestData,
  WelcomeEmailData,
} from "../modules/email/email.templates";

// Mock Resend and logger BEFORE importing emailService
vi.mock("resend");
vi.mock("../utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import { _resetResendClient, _setResendClient, emailService } from "../modules/email/email.service";

describe("emailService", () => {
  const mockEmailSend = vi.fn().mockResolvedValue({ success: true });

  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailSend.mockResolvedValue({ success: true });

    // Setup and inject mock Resend instance
    const mockResendInstance = {
      emails: {
        send: mockEmailSend,
      },
    };

    _resetResendClient();
    _setResendClient(mockResendInstance as never);
  });

  describe("sendWelcomeEmail", () => {
    it("sends welcome email with correct parameters", async () => {
      const data: WelcomeEmailData = { fname: "John" };
      const email = "john@example.com";

      await emailService.sendWelcomeEmail(email, data);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          html: expect.stringContaining("John"),
          subject: "Welcome to WineMarket",
          to: email,
        })
      );
    });

    it("includes customer getting started info in template", async () => {
      const data: WelcomeEmailData = { fname: "Alice" };
      const email = "alice@example.com";

      await emailService.sendWelcomeEmail(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Browse our curated wine collection");
      expect(callArgs.html).toContain("Attend exclusive winemaker events");
      expect(callArgs.html).toContain("Write reviews");
    });
  });

  describe("sendOrderConfirmation", () => {
    it("sends order confirmation with correct parameters", async () => {
      const data: OrderConfirmationData = {
        customerName: "Jane",
        items: [
          { name: "Wine A", quantity: 2, unitPrice: "25.00" },
          { name: "Wine B", quantity: 1, unitPrice: "35.00" },
        ],
        orderId: "order-123",
        totalPrice: "95.00",
      };
      const email = "jane@example.com";

      await emailService.sendOrderConfirmation(email, data);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          html: expect.stringContaining("Jane"),
          subject: expect.stringContaining("order-12"),
          to: email,
        })
      );
    });

    it("includes all order items in email", async () => {
      const data: OrderConfirmationData = {
        customerName: "Jane",
        items: [
          { name: "Wine A", quantity: 2, unitPrice: "25.00" },
          { name: "Wine B", quantity: 1, unitPrice: "35.00" },
        ],
        orderId: "order-123",
        totalPrice: "95.00",
      };
      const email = "jane@example.com";

      await emailService.sendOrderConfirmation(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Wine A");
      expect(callArgs.html).toContain("Wine B");
      expect(callArgs.html).toContain("€95.00");
    });
  });

  describe("sendOrderStatusUpdate", () => {
    it("sends status update email with correct parameters", async () => {
      const data: OrderStatusData = {
        orderId: "order-456",
        status: "shipped",
      };
      const email = "customer@example.com";

      await emailService.sendOrderStatusUpdate(email, data);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          html: expect.stringContaining("order-456"),
          subject: "Your order status has been updated",
          to: email,
        })
      );
    });

    it("includes status label in email for known statuses", async () => {
      const statuses: OrderStatusData["status"][] = [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
      ];

      for (const status of statuses) {
        mockEmailSend.mockClear();

        const data: OrderStatusData = {
          orderId: "order-456",
          status,
        };
        const email = "customer@example.com";

        await emailService.sendOrderStatusUpdate(email, data);

        const callArgs = mockEmailSend.mock.calls[0][0];
        expect(callArgs.html).toMatch(/Pending|Confirmed|Shipped|Delivered/i);
      }
    });
  });

  describe("sendRoleRequestApproved", () => {
    it("sends approval email with correct parameters", async () => {
      const data: RoleRequestData = {
        fname: "Bob",
        role: "winemaker",
      };
      const email = "bob@example.com";

      await emailService.sendRoleRequestApproved(email, data);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          html: expect.stringContaining("Bob"),
          subject: "Your WineMarket application has been approved",
          to: email,
        })
      );
    });

    it("includes role label in email for winemaker", async () => {
      const data: RoleRequestData = {
        fname: "Test",
        role: "winemaker",
      };
      const email = "test@example.com";

      await emailService.sendRoleRequestApproved(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Winemaker");
    });

    it("includes role label in email for shop owner", async () => {
      const data: RoleRequestData = {
        fname: "Test",
        role: "shop_owner",
      };
      const email = "test@example.com";

      await emailService.sendRoleRequestApproved(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Shop Owner");
    });
  });

  describe("sendRoleRequestRejected", () => {
    it("sends rejection email with correct parameters", async () => {
      const data: RoleRequestData = {
        fname: "Carol",
        role: "shop_owner",
      };
      const email = "carol@example.com";

      await emailService.sendRoleRequestRejected(email, data);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          html: expect.stringContaining("Carol"),
          subject: "Update on your WineMarket application",
          to: email,
        })
      );
    });

    it("includes role label in email for winemaker", async () => {
      const data: RoleRequestData = {
        fname: "Test",
        role: "winemaker",
      };
      const email = "test@example.com";

      await emailService.sendRoleRequestRejected(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Winemaker");
    });

    it("includes role label in email for shop owner", async () => {
      const data: RoleRequestData = {
        fname: "Test",
        role: "shop_owner",
      };
      const email = "test@example.com";

      await emailService.sendRoleRequestRejected(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Shop Owner");
    });
  });

  describe("sendEventApproval", () => {
    it("sends event approval email with correct parameters", async () => {
      const data: EventApprovalData = {
        endTime: new Date("2025-06-15T18:00:00"),
        eventName: "Wine Tasting",
        startTime: new Date("2025-06-15T14:00:00"),
        winemakerName: "John Doe",
      };
      const email = "winemaker@example.com";

      await emailService.sendEventApproval(email, data);

      expect(mockEmailSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(String),
          html: expect.stringContaining("John Doe"),
          subject: expect.stringContaining("Wine Tasting"),
          to: email,
        })
      );
    });

    it("includes formatted dates in email", async () => {
      const data: EventApprovalData = {
        endTime: new Date("2025-06-15T18:00:00"),
        eventName: "Wine Tasting",
        startTime: new Date("2025-06-15T14:00:00"),
        winemakerName: "John Doe",
      };
      const email = "winemaker@example.com";

      await emailService.sendEventApproval(email, data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Starts");
      expect(callArgs.html).toContain("Ends");
    });
  });

  describe("email service behavior", () => {
    it("sends emails with proper HTML structure", async () => {
      const data: WelcomeEmailData = { fname: "Test User" };
      await emailService.sendWelcomeEmail("test@example.com", data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("<!DOCTYPE html>");
      expect(callArgs.html).toContain("WineMarket");
    });

    it("handles multiple sequential email sends", async () => {
      const data1: WelcomeEmailData = { fname: "User1" };
      const data2: OrderConfirmationData = {
        customerName: "User2",
        items: [],
        orderId: "ord1",
        totalPrice: "0.00",
      };

      await emailService.sendWelcomeEmail("user1@example.com", data1);
      await emailService.sendOrderConfirmation("user2@example.com", data2);

      expect(mockEmailSend).toHaveBeenCalledTimes(2);
      expect(mockEmailSend.mock.calls[0][0].to).toBe("user1@example.com");
      expect(mockEmailSend.mock.calls[1][0].to).toBe("user2@example.com");
    });

    it("preserves email content in templates", async () => {
      const items = [
        { name: "Barolo 2020", quantity: 2, unitPrice: "45.50" },
        { name: "Prosecco", quantity: 1, unitPrice: "12.00" },
      ];
      const data: OrderConfirmationData = {
        customerName: "Test Customer",
        items,
        orderId: "order-abc-123",
        totalPrice: "102.50",
      };

      await emailService.sendOrderConfirmation("test@example.com", data);

      const callArgs = mockEmailSend.mock.calls[0][0];
      expect(callArgs.html).toContain("Barolo 2020");
      expect(callArgs.html).toContain("Prosecco");
      expect(callArgs.html).toContain("102.50");
    });

    it("all email methods send with from address", async () => {
      const methods = [
        () => emailService.sendWelcomeEmail("test@example.com", { fname: "Test" }),
        () =>
          emailService.sendOrderConfirmation("test@example.com", {
            customerName: "Test",
            items: [],
            orderId: "ord1",
            totalPrice: "0.00",
          }),
        () =>
          emailService.sendOrderStatusUpdate("test@example.com", {
            orderId: "ord1",
            status: "pending",
          }),
        () =>
          emailService.sendRoleRequestApproved("test@example.com", {
            fname: "Test",
            role: "winemaker",
          }),
        () =>
          emailService.sendRoleRequestRejected("test@example.com", {
            fname: "Test",
            role: "winemaker",
          }),
        () =>
          emailService.sendEventApproval("test@example.com", {
            endTime: new Date(),
            eventName: "Event",
            startTime: new Date(),
            winemakerName: "Maker",
          }),
      ];

      for (const method of methods) {
        mockEmailSend.mockClear();
        await method();
        const callArgs = mockEmailSend.mock.calls[0][0];
        expect(callArgs.from).toBeDefined();
        expect(typeof callArgs.from).toBe("string");
        expect(callArgs.from.length).toBeGreaterThan(0);
      }
    });
  });
});
