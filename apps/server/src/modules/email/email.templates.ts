function header(): string {
  return `<div style="background:#722F37;padding:16px 24px;">
    <h1 style="margin:0;color:#fff;font-size:22px;font-family:Arial,sans-serif;">WineMarket</h1>
  </div>`;
}

function footer(): string {
  return `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e5e5;color:#999;font-size:12px;font-family:Arial,sans-serif;">
    WineMarket — Connecting wine lovers with exceptional winemakers.
  </div>`;
}

function wrap(content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:0;background:#f9f9f9;">
    <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
      ${header()}
      <div style="padding:24px;font-family:Arial,sans-serif;color:#333;">${content}</div>
      <div style="padding:0 24px 24px;">${footer()}</div>
    </div>
  </body></html>`;
}

export type OrderConfirmationData = {
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; unitPrice: string }[];
  totalPrice: string;
};

export function orderConfirmationTemplate(data: OrderConfirmationData): string {
  const rows = data.items
    .map(
      (i) => `<tr>
        <td style="padding:8px;border:1px solid #e5e5e5;">${i.name}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:center;">${i.quantity}</td>
        <td style="padding:8px;border:1px solid #e5e5e5;text-align:right;">€${i.unitPrice}</td>
      </tr>`
    )
    .join("");

  return wrap(`
    <h2 style="margin-top:0;">Order Confirmed</h2>
    <p>Thank you, <strong>${data.customerName}</strong>! Your order has been placed successfully.</p>
    <p style="color:#666;">Order ID: <code>${data.orderId}</code></p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;border:1px solid #e5e5e5;text-align:left;">Product</th>
          <th style="padding:8px;border:1px solid #e5e5e5;">Qty</th>
          <th style="padding:8px;border:1px solid #e5e5e5;text-align:right;">Unit Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:18px;"><strong>Total: €${data.totalPrice}</strong></p>
  `);
}

export type OrderStatusData = {
  orderId: string;
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  cancelled: "Cancelled — your order has been cancelled.",
  confirmed: "Confirmed — your order is being prepared.",
  delivered: "Delivered — your order has arrived.",
  pending: "Pending — we have received your order.",
  shipped: "Shipped — your order is on its way.",
};

export function orderStatusUpdateTemplate(data: OrderStatusData): string {
  const label = STATUS_LABELS[data.status] ?? `Status updated to: ${data.status}`;
  return wrap(`
    <h2 style="margin-top:0;">Order Status Update</h2>
    <p>Your order status has been updated.</p>
    <p style="color:#666;">Order ID: <code>${data.orderId}</code></p>
    <p style="font-size:16px;"><strong>${label}</strong></p>
  `);
}

export type RoleRequestData = {
  fname: string;
  role: "winemaker" | "shop_owner";
};

const ROLE_LABELS: Record<RoleRequestData["role"], string> = {
  shop_owner: "Shop Owner",
  winemaker: "Winemaker",
};

export function roleRequestApprovedTemplate(data: RoleRequestData): string {
  const label = ROLE_LABELS[data.role];
  return wrap(`
    <h2 style="margin-top:0;">Application Approved</h2>
    <p>Hi <strong>${data.fname}</strong>,</p>
    <p>Your application for the <strong>${label}</strong> role has been approved.</p>
    <p>You can now log in and access your ${label.toLowerCase()} dashboard to get started.</p>
  `);
}

export function roleRequestRejectedTemplate(data: RoleRequestData): string {
  const label = ROLE_LABELS[data.role];
  return wrap(`
    <h2 style="margin-top:0;">Application Update</h2>
    <p>Hi <strong>${data.fname}</strong>,</p>
    <p>Unfortunately, your application for the <strong>${label}</strong> role was not approved at this time.</p>
    <p>If you have questions, please contact our support team.</p>
  `);
}

export type WelcomeEmailData = {
  fname: string;
};

export function welcomeEmailTemplate(data: WelcomeEmailData): string {
  return wrap(`
    <h2 style="margin-top:0;">Welcome to WineMarket</h2>
    <p>Hi <strong>${data.fname}</strong>,</p>
    <p>Thank you for joining WineMarket! We're excited to have you in our community of wine enthusiasts.</p>
    <p>Whether you're here to explore wines, manage your collection, or connect with winemakers, you'll find everything you need right here.</p>
    <p style="margin-top:24px;"><strong>Getting started:</strong></p>
    <ul style="margin:8px 0;padding-left:24px;">
      <li>Browse our curated wine collection</li>
      <li>Attend exclusive winemaker events</li>
      <li>Write reviews and share your thoughts</li>
      <li>Connect with other wine enthusiasts</li>
    </ul>
    <p style="margin-top:16px;">If you have any questions, feel free to reach out to our support team.</p>
    <p>Cheers,<br>The WineMarket Team</p>
  `);
}
