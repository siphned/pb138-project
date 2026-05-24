<<<<<<< HEAD
import { Alert01Icon, Loading01Icon, Package01Icon } from "hugeicons-react";
=======
import { MoreHorizontal, Package, Plus } from "lucide-react";
>>>>>>> origin/main
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
<<<<<<< HEAD
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { getStockStatus } from "@/utils/stock";
=======
>>>>>>> origin/main

export function WinemakerBundles() {
  const [statusFilter, setStatusFilter] = useState("all");

<<<<<<< HEAD
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProducts({
    isBundle: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Loading01Icon className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading bundles...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
        <Alert01Icon className="h-8 w-8" />
        <p className="font-medium">Failed to load bundles</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  const bundles = products?.data ?? [];

  if (bundles.length === 0) {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">My Bundles</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package01Icon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bundles yet</h3>
          <p className="text-muted-foreground">Create wine bundles to offer curated selections.</p>
        </div>
      </>
    );
  }

  const filteredBundles = bundles.filter((bundle) => {
    if (statusFilter === "all") return true;
    const qty = Number(bundle.quantity);
    const status = getStockStatus(qty).label;
    if (statusFilter === "active") return status === "In Stock";
    return status.toLowerCase().replace(/\s+/g, "") === statusFilter.toLowerCase();
  });

  const bundleWines = (wines: (typeof bundles)[number]["wines"]) =>
    wines.map((w) => w.name).join(", ");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Bundles</h3>
        <div className="flex items-center gap-2">
          <Select onValueChange={(val) => val && setStatusFilter(val)} value={statusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">In Stock</SelectItem>
              <SelectItem value="lowstock">Low Stock</SelectItem>
              <SelectItem value="outofstock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <Package01Icon className="mr-1 h-4 w-4" /> Create Bundle
=======
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
>>>>>>> origin/main
          </Button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bundle Name</TableHead>
              <TableHead>Contents</TableHead>
              <TableHead className="text-right">Available Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBundles.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-muted-foreground py-8" colSpan={5}>
                  No bundles found in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredBundles.map((bundle) => {
                const qty = Number(bundle.quantity);
                const stock = getStockStatus(qty);
                return (
                  <TableRow key={bundle.id}>
                    <TableCell className="font-medium">{bundle.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[250px] truncate">
                      {bundleWines(bundle.wines)}
                    </TableCell>
                    <TableCell className="text-right">{qty}</TableCell>
                    <TableCell className="text-right font-medium">
                      €{Number(bundle.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={stock.classes} variant="outline">
                        {stock.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
=======
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
>>>>>>> origin/main
          </TableBody>
        </Table>
      </div>

<<<<<<< HEAD
      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredBundles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No bundles found in this category.
          </p>
        ) : (
          filteredBundles.map((bundle) => {
            const qty = Number(bundle.quantity);
            const stock = getStockStatus(qty);
            return (
              <div className="rounded-lg border p-4 space-y-2" key={bundle.id}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{bundle.name}</span>
                  <Badge className={stock.classes} variant="outline">
                    {stock.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {bundleWines(bundle.wines)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Qty: {qty}</span>
                  <span className="font-semibold">€{Number(bundle.price).toFixed(2)}</span>
                </div>
              </div>
            );
          })
        )}
=======
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
>>>>>>> origin/main
      </div>
    </>
  );
}
