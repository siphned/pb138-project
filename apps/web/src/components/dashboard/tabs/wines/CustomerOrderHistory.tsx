<<<<<<< HEAD
import { Alert01Icon, Loading01Icon, ShoppingBag01Icon } from "hugeicons-react";
=======
import { ArrowUpRight, ShoppingBag } from "lucide-react";
>>>>>>> origin/main
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
<<<<<<< HEAD
import { useGetOrders } from "@/generated/hooks/useGetOrders";

export function CustomerOrderHistory() {
  const [timeframe, setTimeframe] = useState("6months");
  const { data: orders, isLoading, isError } = useGetOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Loading01Icon className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading orders...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
        <Alert01Icon className="h-8 w-8" />
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
          <ShoppingBag01Icon className="h-12 w-12 text-muted-foreground mb-4" />
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
=======

export function CustomerOrderHistory() {
  const [timeframe, setTimeframe] = useState("6months");

  const allOrders = [
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      date: "April 12, 2026",
      id: 1,
      isRecent: true,
      items: "3 Bottles",
      orderId: "#ORD-7392",
      status: "Delivered",
      total: "€425.00",
      year: "2026",
    },
    {
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
      date: "March 28, 2026",
      id: 2,
      isRecent: true,
      items: "1 Bottle",
      orderId: "#ORD-7391",
      status: "Processing",
      total: "€150.00",
      year: "2026",
    },
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      date: "November 15, 2025",
      id: 3,
      isRecent: false,
      items: "2 Bottles",
      orderId: "#ORD-6210",
      status: "Delivered",
      total: "€280.00",
      year: "2025",
    },
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      date: "June 04, 2024",
      id: 4,
      isRecent: false,
      items: "6 Bottles",
      orderId: "#ORD-5102",
      status: "Delivered",
      total: "€890.00",
      year: "2024",
    },
  ];

  const filteredOrders = allOrders.filter((order) => {
    if (timeframe === "6months") return order.isRecent;
    return order.year === timeframe;
  });

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <ShoppingBag className="h-5 w-5" /> Past Orders
        </div>
        <div className="flex w-full md:w-auto">
          <Select onValueChange={(val) => setTimeframe(val || "6months")} value={timeframe}>
            <SelectTrigger className="w-full sm:w-40 bg-background border-none rounded-lg h-10 focus:ring-1 focus:ring-primary/20">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <>
          {/* --- DESKTOP VIEW --- */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Order ID</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">
                    Items
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow className="border-border/50 border-b" key={order.id}>
                    <TableCell className="font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer text-sm">
                      {order.orderId} <ArrowUpRight className="h-3 w-3" />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{order.date}</TableCell>
                    <TableCell className="text-center font-medium text-sm">{order.items}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${order.badgeClasses} border-none`}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-sm">{order.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* --- MOBILE VIEW --- */}
          <div className="md:hidden flex flex-col">
            {filteredOrders.map((order) => (
              <div
                className="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
                key={order.id}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="font-heading font-semibold text-[15px] text-primary flex items-center gap-1">
                    {order.orderId} <ArrowUpRight className="h-3 w-3" />
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {order.date} <span className="mx-1">|</span> {order.items}
                  </span>
                  <div className="pt-1.5">
                    <Badge className={`${order.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div className="font-medium text-[15px]">{order.total}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-12 text-center text-muted-foreground">
          No orders found for this timeframe.
        </div>
      )}
>>>>>>> origin/main
    </>
  );
}
