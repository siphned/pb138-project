import { AlertTriangle, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetOrders } from "@/generated/hooks/useGetOrders";

export function CustomerOrderHistory() {
  const [timeframe, setTimeframe] = useState("6months");
  const { data: orders, isLoading, isError } = useGetOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading orders...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
        <AlertTriangle className="h-8 w-8" />
        <p className="font-medium">Failed to load orders</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Past Orders</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
          <p className="text-muted-foreground">Your order history will appear here.</p>
        </div>
      </>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt as string);
    if (timeframe === "6months") {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return orderDate >= sixMonthsAgo;
    }
    return orderDate.getFullYear().toString() === timeframe;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-50 text-green-800 hover:bg-green-50";
      case "processing":
        return "bg-orange-50 text-orange-600 hover:bg-orange-50";
      case "cancelled":
        return "bg-red-50 text-red-700 hover:bg-red-50";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Past Orders</h3>
        <Select onValueChange={(val) => val && setTimeframe(val)} value={timeframe}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">Last 6 months</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-muted-foreground py-8" colSpan={4}>
                  No orders found for this timeframe.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {new Date(order.createdAt as string).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(order.status)} variant="outline">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    €{Number(order.totalPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No orders found for this timeframe.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div className="rounded-lg border p-4 space-y-2" key={order.id}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                <Badge className={getStatusBadge(order.status)} variant="outline">
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{new Date(order.createdAt as string).toLocaleDateString()}</span>
                <span className="font-semibold text-foreground">
                  €{Number(order.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
