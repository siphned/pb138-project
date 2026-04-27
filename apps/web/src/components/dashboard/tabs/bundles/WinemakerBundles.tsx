import { MoreHorizontal, Package, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function WinemakerBundles() {
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data reflecting your database relationships
  const bundlesData = [
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      creatableQty: 14,
      id: 1,
      items: "3 Bottles (Montrose 2018, 2019, 2020)",
      name: "Holiday Red Trio", // How many can be made from current inventory
      price: "€320.00",
      status: "Active",
    },
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      creatableQty: 26,
      id: 2,
      items: "6 Bottles (Montrose Rose 2021)",
      name: "Summer Rosé Special",
      price: "€150.00",
      status: "Active",
    },
    {
      badgeClasses: "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFEBEE]",
      creatableQty: 0,
      id: 3,
      items: "5 Bottles (Rare Vintages)",
      name: "Collector's Vertical", // Missing inventory for this bundle
      price: "€850.00",
      status: "Out of Stock",
    },
  ];

  const filteredData = bundlesData.filter((bundle) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return bundle.status === "Active";
    return bundle.status.toLowerCase().replace(/\s+/g, "") === statusFilter.toLowerCase();
  });

  return (
    <>
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Package className="h-5 w-5" /> My Bundles
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select onValueChange={(val) => setStatusFilter(val || "all")} value={statusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="outofstock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus className="h-4 w-4 mr-2" /> Create Bundle
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Bundle Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Contents</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Buildable Qty
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Price</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((bundle) => (
              <TableRow className="border-border/50 border-b" key={bundle.id}>
                <TableCell className="font-medium text-sm">{bundle.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{bundle.items}</TableCell>
                <TableCell className="text-center font-medium text-sm">
                  {bundle.creatableQty > 0 ? (
                    bundle.creatableQty
                  ) : (
                    <span className="text-destructive">0</span>
                  )}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{bundle.price}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${bundle.badgeClasses} border-none`}>{bundle.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden flex flex-col">
        {filteredData.map((bundle) => (
          <div
            className="flex justify-between py-5 border-b border-border/50 last:border-0"
            key={bundle.id}
          >
            <div className="flex flex-col gap-1.5 w-full pr-4">
              <span className="font-heading font-semibold text-[15px] truncate">{bundle.name}</span>
              <span className="text-xs text-muted-foreground font-medium truncate">
                {bundle.items}
              </span>
              <div className="flex items-center gap-3 pt-1.5">
                <Badge className={`${bundle.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {bundle.status}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  Can build: {bundle.creatableQty}
                </span>
                <span className="text-sm font-semibold ml-auto">{bundle.price}</span>
              </div>
            </div>
            <Button
              className="h-8 w-8 shrink-0 -mr-2 text-muted-foreground"
              size="icon"
              variant="ghost"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
