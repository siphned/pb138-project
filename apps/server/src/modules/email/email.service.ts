import { Resend } from "resend";
import type { OrderConfirmationData, OrderStatusData, RoleRequestData } from "./email.templates";
import {
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  roleRequestApprovedTemplate,
  roleRequestRejectedTemplate,
} from "./email.templates";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.FROM_EMAIL ?? "noreply@winemarket.com";

// The Resend SDK does NOT throw on API errors (unverified sender domain, invalid
// recipient, sandbox limits, bad key, …) — it resolves to `{ data, error }`. If we
// ignore `error`, every failure looks like a success and no email is ever sent.
// Surface it as a thrown error so callers' `.catch()` logging fires.
async function send(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set — cannot send email");
  }
  const { error } = await getResend().emails.send({
    from: FROM,
    html: opts.html,
    subject: opts.subject,
    to: opts.to,
  });
  if (error) {
    throw new Error(
      `Resend rejected email "${opts.subject}" (from=${FROM}): ${error.name} — ${error.message}`
    );
  }
}

export interface IEmailService {
  sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void>;
  sendOrderStatusUpdate(to: string, data: OrderStatusData): Promise<void>;
  sendRoleRequestApproved(to: string, data: RoleRequestData): Promise<void>;
  sendRoleRequestRejected(to: string, data: RoleRequestData): Promise<void>;
}

export const emailService: IEmailService = {
  async sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void> {
    await send({
      html: orderConfirmationTemplate(data),
      subject: `Order confirmed — #${data.orderId.slice(0, 8)}`,
      to,
    });
  },

  async sendOrderStatusUpdate(to: string, data: OrderStatusData): Promise<void> {
    await send({
      html: orderStatusUpdateTemplate(data),
      subject: "Your order status has been updated",
      to,
    });
  },

  async sendRoleRequestApproved(to: string, data: RoleRequestData): Promise<void> {
    await send({
      html: roleRequestApprovedTemplate(data),
      subject: "Your WineMarket application has been approved",
      to,
    });
  },

  async sendRoleRequestRejected(to: string, data: RoleRequestData): Promise<void> {
    await send({
      html: roleRequestRejectedTemplate(data),
      subject: "Update on your WineMarket application",
      to,
    });
  },
};
