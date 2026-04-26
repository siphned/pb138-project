import { Resend } from "resend";
import type {
  EventApprovalData,
  OrderConfirmationData,
  OrderStatusData,
  RoleRequestData,
} from "./email.templates";
import {
  eventApprovalTemplate,
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  roleRequestApprovedTemplate,
  roleRequestRejectedTemplate,
} from "./email.templates";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.FROM_EMAIL ?? "noreply@winemarket.com";

export const emailService = {
  async sendEventApproval(to: string, data: EventApprovalData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: eventApprovalTemplate(data),
      subject: `Your event "${data.eventName}" has been approved`,
      to,
    });
    console.log(`[email] event approval sent to ${to}`);
  },
  async sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: orderConfirmationTemplate(data),
      subject: `Order confirmed — #${data.orderId.slice(0, 8)}`,
      to,
    });
    console.log(`[email] order confirmation sent to ${to}`);
  },

  async sendOrderStatusUpdate(to: string, data: OrderStatusData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: orderStatusUpdateTemplate(data),
      subject: "Your order status has been updated",
      to,
    });
    console.log(`[email] order status update sent to ${to}`);
  },

  async sendRoleRequestApproved(to: string, data: RoleRequestData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: roleRequestApprovedTemplate(data),
      subject: "Your WineMarket application has been approved",
      to,
    });
    console.log(`[email] role approved sent to ${to}`);
  },

  async sendRoleRequestRejected(to: string, data: RoleRequestData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: roleRequestRejectedTemplate(data),
      subject: "Update on your WineMarket application",
      to,
    });
    console.log(`[email] role rejected sent to ${to}`);
  },
};
