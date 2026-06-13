import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";
import { cn, formatEur } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  component: OrderDetailPage,
});

const formatDate = (date: unknown): string => {
  if (typeof date === "string" || typeof date === "number") {
    return new Date(date).toLocaleDateString("en-IE", { dateStyle: "medium" });
  }
  return "—";
};

const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-warning-bg text-warning";
    case "confirmed":
    case "shipped":
      return "bg-secondary text-secondary-foreground";
    case "delivered":
      return "bg-success-bg text-success";
    case "cancelled":
      return "bg-destructive/10 text-destructive";
    default:
      return "bg-muted/30 text-muted-foreground";
  }
};

type OrderAddress = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

function AddressBlock({ address }: { address: OrderAddress }) {
  return (
    <DescriptionList>
      <PropertyRow label="Street" value={address.street} />
      <PropertyRow label="House number" value={address.houseNumber} />
      <PropertyRow label="City" value={address.city} />
      <PropertyRow label="Postal code" value={address.postalCode} />
      <PropertyRow label="Country" value={address.country} />
    </DescriptionList>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function OrderDetailPage() {
  const { id } = Route.useParams();
  const { data: order, isLoading, isError, refetch } = useGetOrdersById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't find the order you're looking for."
          onRetry={() => refetch()}
          title="Order not found"
        />
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.unitPriceAtPurchase) * item.quantity,
    0
  );
  const discount = Number(order.discount);

  return (
    <div className="container mx-auto max-w-4xl space-y-10 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/orders"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader description={`Placed ${formatDate(order.createdAt)}`} title="Order details" />
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
            statusBadgeClass(order.status)
          )}
        >
          {order.status}
        </span>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEur(item.unitPriceAtPurchase)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEur(Number(item.unitPriceAtPurchase) * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Shipping address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressBlock address={order.shippingAddress} />
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Billing address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressBlock address={order.billingAddress} />
          </CardContent>
        </Card>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <SummaryRow label="Subtotal" value={formatEur(subtotal)} />
          {discount > 0 && <SummaryRow label="Discount" value={`−${formatEur(discount)}`} />}
          <SummaryRow label="Shipping" value={formatEur(order.shippingFee)} />
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{formatEur(order.totalPrice)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
            <span>Payment</span>
            <span className="capitalize">
              {order.paymentMethod} · {order.paymentStatus}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
