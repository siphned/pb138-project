import { ArrowUpRight02Icon, ShoppingBag01Icon } from "hugeicons-react";
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
import { statusVariant } from "./statusVariant";

const orderData = [
  {
    date: "April 12, 2026",
    id: 1,
    items: "3 Bottles",
    orderId: "#ORD-7392",
    status: "Delivered",
    total: "€425.00",
  },
  {
    date: "March 28, 2026",
    id: 2,
    items: "1 Bottle",
    orderId: "#ORD-7391",
    status: "Processing",
    total: "€150.00",
  },
];

export function CustomerOrderHistoryTab() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <ShoppingBag01Icon className="h-5 w-5" /> Past Orders
        </div>
        <div className="flex w-full md:w-auto">
          <Select defaultValue="6months">
            <SelectTrigger className="w-full sm:w-[160px] bg-background border-none rounded-lg h-10">
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

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Order ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Items</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderData.map((order) => (
              <TableRow className="border-border/50 border-b" key={order.id}>
                <TableCell className="font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer text-sm">
                  {order.orderId} <ArrowUpRight02Icon className="h-3 w-3" />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{order.date}</TableCell>
                <TableCell className="text-center font-medium text-sm">{order.items}</TableCell>
                <TableCell className="text-center">
                  <Badge className="border-none" variant={statusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-sm">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden flex flex-col">
        {orderData.map((order) => (
          <div
            className="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
            key={order.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-sm text-primary flex items-center gap-1">
                {order.orderId} <ArrowUpRight02Icon className="h-3 w-3" />
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {order.date} <span className="mx-1">|</span> {order.items}
              </span>
              <div className="pt-1.5">
                <Badge className="border-none px-2 py-0.5" variant={statusVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div className="font-medium text-sm">{order.total}</div>
          </div>
        ))}
      </div>
    </>
  );
}
