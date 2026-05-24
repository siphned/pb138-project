"use client";

import { ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetOrders } from "@/generated/hooks/useGetOrders";
import { usePatchOrdersByIdStatus } from "@/generated/hooks/usePatchOrdersByIdStatus";

interface OrdersTabProps {
  shopId: string;
}

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

const statusColors: Record<OrderStatus, string> = {
  cancelled: "bg-destructive/30 text-destructive dark:text-red-400",
  confirmed: "bg-blue-100/30 text-blue-700 dark:text-blue-400",
  delivered: "bg-green-100/30 text-green-700 dark:text-green-400",
  pending: "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400",
  shipped: "bg-purple-100/30 text-purple-700 dark:text-purple-400",
};

export function OrdersTab({ shopId }: OrdersTabProps) {
  const { data, isLoading, error } = useGetOrders({ shopId });
  const statusMutation = usePatchOrdersByIdStatus();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const orders = (data || []) as any[];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await statusMutation.mutateAsync({
        data: { status: newStatus },
        id: orderId,
      });
    } catch {
      // Error is handled by mutation error state
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage your shop orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            Failed to load orders: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>View and manage your shop orders</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]" />
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const status = (order.status || "pending").toLowerCase() as OrderStatus;
                      const customerName = order.guestName || order.userId || "Unknown";

                      return (
                        <TableRow className="hover:bg-muted/50" key={order.id}>
                          <TableCell>
                            <Button
                              className="h-8 w-8 p-0"
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              size="sm"
                              variant="ghost"
                            >
                              {isExpanded ? (
                                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} />
                              ) : (
                                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="text-sm">{customerName}</TableCell>
                          <TableCell className="text-sm">{order.itemCount || "—"} items</TableCell>
                          <TableCell className="font-semibold">${order.totalPrice}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                statusColors[status] || statusColors.pending
                              }`}
                            >
                              {status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Expanded Order Details */}
              {expandedOrder && (
                <div className="rounded-md border border-border p-4 bg-muted/30">
                  {orders.find((o) => o.id === expandedOrder) && (
                    <ExpandedOrderDetails
                      isUpdating={statusMutation.isPending}
                      onStatusChange={handleStatusChange}
                      order={orders.find((o) => o.id === expandedOrder)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExpandedOrderDetails({
  order,
  onStatusChange,
  isUpdating,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  order: any;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
  isUpdating: boolean;
}) {
  const currentStatus = (order.status || "pending").toLowerCase() as OrderStatus;

  const statusOptions: OrderStatus[] = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Order ID</p>
          <p className="font-mono text-sm mt-1">{order.id}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Customer</p>
          <p className="text-sm mt-1">{order.guestName || order.userId || "Unknown"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Price</p>
          <p className="text-sm font-semibold mt-1">${order.totalPrice}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Delivery Type</p>
          <p className="text-sm mt-1 capitalize">{order.deliveryType || "—"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
          <p className="text-sm mt-1 capitalize">{order.paymentStatus || "—"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Order Date</p>
          <p className="text-sm mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">Update Status</p>
        <div className="flex items-center gap-3">
          <Select
            onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}
            value={currentStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isUpdating && (
            <span className="h-4 w-4 animate-spin text-muted-foreground inline-block">⏳</span>
          )}
        </div>
      </div>
    </div>
  );
}
