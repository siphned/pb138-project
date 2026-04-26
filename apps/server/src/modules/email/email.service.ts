import { Resend } from "resend";
import {
  eventApprovalTemplate,
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  roleRequestApprovedTemplate,
  roleRequestRejectedTemplate,
} from "./email.templates";
import type {
  EventApprovalData,
  OrderConfirmationData,
  OrderStatusData,
  RoleRequestData,
} from "./email.templates";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.FROM_EMAIL ?? "noreply@winemarket.com";

export const emailService = {
  async sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void> {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Order confirmed — #${data.orderId.slice(0, 8)}`,
      html: orderConfirmationTemplate(data),
    });
    console.log(`[email] order confirmation sent to ${to}`);
  },

  async sendOrderStatusUpdate(to: string, data: OrderStatusData): Promise<void> {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your order status has been updated",
      html: orderStatusUpdateTemplate(data),
    });
    console.log(`[email] order status update sent to ${to}`);
  },

  async sendEventApproval(to: string, data: EventApprovalData): Promise<void> {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Your event "${data.eventName}" has been approved`,
      html: eventApprovalTemplate(data),
    });
    console.log(`[email] event approval sent to ${to}`);
  },

  async sendRoleRequestApproved(to: string, data: RoleRequestData): Promise<void> {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your WineMarket application has been approved",
      html: roleRequestApprovedTemplate(data),
    });
    console.log(`[email] role approved sent to ${to}`);
  },

  async sendRoleRequestRejected(to: string, data: RoleRequestData): Promise<void> {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Update on your WineMarket application",
      html: roleRequestRejectedTemplate(data),
    });
    console.log(`[email] role rejected sent to ${to}`);
  },
};
