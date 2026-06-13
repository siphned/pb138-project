import { Resend } from "resend";
import type {
  OrderConfirmationData,
  OrderStatusData,
  RoleRequestData,
} from "./email.templates";
import {
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  roleRequestApprovedTemplate,
  roleRequestRejectedTemplate,
} from "./email.templates";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.FROM_EMAIL ?? "noreply@winemarket.com";

export interface IEmailService {
  sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void>;
  sendOrderStatusUpdate(to: string, data: OrderStatusData): Promise<void>;
  sendRoleRequestApproved(to: string, data: RoleRequestData): Promise<void>;
  sendRoleRequestRejected(to: string, data: RoleRequestData): Promise<void>;
}

export const emailService: IEmailService = {
  async sendOrderConfirmation(to: string, data: OrderConfirmationData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: orderConfirmationTemplate(data),
      subject: `Order confirmed — #${data.orderId.slice(0, 8)}`,
      to,
    });
  },

  async sendOrderStatusUpdate(to: string, data: OrderStatusData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: orderStatusUpdateTemplate(data),
      subject: "Your order status has been updated",
      to,
    });
  },

  async sendRoleRequestApproved(to: string, data: RoleRequestData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: roleRequestApprovedTemplate(data),
      subject: "Your WineMarket application has been approved",
      to,
    });
  },

  async sendRoleRequestRejected(to: string, data: RoleRequestData): Promise<void> {
    await getResend().emails.send({
      from: FROM,
      html: roleRequestRejectedTemplate(data),
      subject: "Update on your WineMarket application",
      to,
    });
  },
};
