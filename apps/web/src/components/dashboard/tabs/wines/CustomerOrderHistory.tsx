import { ArrowUpRight, ShoppingBag } from "lucide-react";
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

export function CustomerOrderHistory() {
  const [timeframe, setTimeframe] = useState("6months");

  const allOrders = [
    {
      id: 1,
      orderId: "#ORD-7392",
      date: "April 12, 2026",
      items: "3 Bottles",
      total: "€425.00",
      status: "Delivered",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      year: "2026",
      isRecent: true,
    },
    {
      id: 2,
      orderId: "#ORD-7391",
      date: "March 28, 2026",
      items: "1 Bottle",
      total: "€150.00",
      status: "Processing",
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
      year: "2026",
      isRecent: true,
    },
    {
      id: 3,
      orderId: "#ORD-6210",
      date: "November 15, 2025",
      items: "2 Bottles",
      total: "€280.00",
      status: "Delivered",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      year: "2025",
      isRecent: false,
    },
    {
      id: 4,
      orderId: "#ORD-5102",
      date: "June 04, 2024",
      items: "6 Bottles",
      total: "€890.00",
      status: "Delivered",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      year: "2024",
      isRecent: false,
    },
  ];

  const filteredOrders = allOrders.filter((order) => {
    if (timeframe === "6months") return order.isRecent;
    return order.year === timeframe;
  });

  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <ShoppingBag class="h-5 w-5" /> Past Orders
        </div>
        <div class="flex w-full md:w-auto">
          <Select value={timeframe} onValueChange={(val) => setTimeframe(val || "6months")}>
            <SelectTrigger class="w-full sm:w-40 bg-background border-none rounded-lg h-10 focus:ring-1 focus:ring-primary/20">
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
          <div class="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow class="border-border/50 hover:bg-transparent">
                  <TableHead class="text-muted-foreground font-medium">Order ID</TableHead>
                  <TableHead class="text-muted-foreground font-medium">Date</TableHead>
                  <TableHead class="text-muted-foreground font-medium text-center">Items</TableHead>
                  <TableHead class="text-muted-foreground font-medium text-center">
                    Status
                  </TableHead>
                  <TableHead class="text-muted-foreground font-medium text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} class="border-border/50 border-b">
                    <TableCell class="font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer text-sm">
                      {order.orderId} <ArrowUpRight class="h-3 w-3" />
                    </TableCell>
                    <TableCell class="text-muted-foreground text-sm">{order.date}</TableCell>
                    <TableCell class="text-center font-medium text-sm">{order.items}</TableCell>
                    <TableCell class="text-center">
                      <Badge class={`${order.badgeClasses} border-none`}>{order.status}</Badge>
                    </TableCell>
                    <TableCell class="text-right font-medium text-sm">{order.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* --- MOBILE VIEW --- */}
          <div class="md:hidden flex flex-col">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                class="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
              >
                <div class="flex flex-col gap-1.5">
                  <span class="font-heading font-semibold text-[15px] text-primary flex items-center gap-1">
                    {order.orderId} <ArrowUpRight class="h-3 w-3" />
                  </span>
                  <span class="text-xs text-muted-foreground font-medium">
                    {order.date} <span class="mx-1">|</span> {order.items}
                  </span>
                  <div class="pt-1.5">
                    <Badge class={`${order.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                <div class="font-medium text-[15px]">{order.total}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div class="py-12 text-center text-muted-foreground">
          No orders found for this timeframe.
        </div>
      )}
    </>
  );
}
