<<<<<<< HEAD
import {
  Alert01Icon,
  DrinkIcon,
  Loading01Icon,
  MoreHorizontalIcon,
  PlusSignIcon,
} from "hugeicons-react";
=======
import { MoreHorizontal, Plus, Wine } from "lucide-react";
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
import { useGetWines } from "@/generated/hooks/useGetWines";
=======
>>>>>>> origin/main
import { getStockStatus } from "@/utils/stock";

export function WinemakerInventory() {
  const [statusFilter, setStatusFilter] = useState("all");

<<<<<<< HEAD
  const {
    data: wines,
    isLoading,
    isError,
  } = useGetWines({
    winemakerId: "me",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Loading01Icon className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading wines...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
        <Alert01Icon className="h-8 w-8" />
        <p className="font-medium">Failed to load wines</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!wines || wines.length === 0) {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">My Wines</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <DrinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No wines yet</h3>
          <p className="text-muted-foreground">
            Add your first wine to start building your catalog.
          </p>
        </div>
      </>
    );
  }

  const filteredWines = wines.filter((wine) => {
    if (statusFilter === "all") return true;
    const status = getStockStatus(Number(wine.quantity)).label;
=======
  // Store data in an array
  const inventoryData = [
    {
      category: "Red",
      id: 1,
      name: "Chateau Montrose 2018",
      qty: 82,
      vintage: "2018",
    },
    {
      category: "white",
      id: 2,
      name: "La Dame de Montrose 2019",
      qty: 8,
      vintage: "2019",
    },
    {
      category: "Red",
      id: 3,
      name: "Tertio de Montrose 2020",
      qty: 0,
      vintage: "2020",
    },
    {
      category: "white",
      id: 4,
      name: "Montrose Rose 2021",
      qty: 156,
      vintage: "2021",
    },
  ];

  const filteredData = inventoryData.filter((wine) => {
    if (statusFilter === "all") return true;
    const status = getStockStatus(wine.qty).label; // "In Stock", "Low Stock", "Out of Stock"
>>>>>>> origin/main
    if (statusFilter === "active") return status === "In Stock";
    return status.toLowerCase().replace(/\s+/g, "") === statusFilter.toLowerCase();
  });

  return (
    <>
<<<<<<< HEAD
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Wines</h3>
        <div className="flex items-center gap-2">
          <Select onValueChange={(val) => val && setStatusFilter(val)} value={statusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">In Stock</SelectItem>
=======
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine className="h-5 w-5" /> My Wines
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select onValueChange={(val) => setStatusFilter(val || "all")} value={statusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active (In Stock)</SelectItem>
>>>>>>> origin/main
              <SelectItem value="lowstock">Low Stock</SelectItem>
              <SelectItem value="outofstock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
<<<<<<< HEAD
          <Button size="sm">
            <PlusSignIcon className="mr-1 h-4 w-4" /> Add Wine
=======
          <Button className="w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus className="h-4 w-4 mr-2" /> Add
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
              <TableHead>Wine Name</TableHead>
              <TableHead>Vintage</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWines.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-muted-foreground py-8" colSpan={5}>
                  No wines found in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredWines.map((wine) => {
                const qty = Number(wine.quantity);
                const stock = getStockStatus(qty);
                return (
                  <TableRow key={wine.id}>
                    <TableCell className="font-medium">{wine.name}</TableCell>
                    <TableCell>{wine.vintageYear}</TableCell>
                    <TableCell className="text-right">{qty}</TableCell>
                    <TableCell>
                      <Badge className={stock.classes} variant="outline">
                        {stock.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredWines.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No wines found in this category.</p>
        ) : (
          filteredWines.map((wine) => {
            const qty = Number(wine.quantity);
            const stock = getStockStatus(qty);
            return (
              <div className="rounded-lg border p-4 space-y-2" key={wine.id}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{wine.name}</span>
                  <Badge className={stock.classes} variant="outline">
                    {stock.label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Vintage: {wine.vintageYear}</span>
                  <span>Qty: {qty}</span>
                </div>
              </div>
            );
          })
=======
      {/* --- RESPONSIVE INVENTORY VIEW --- */}
      <div className="w-full">
        <Table>
          <TableHeader className="hidden md:table-header-group">
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Vintage
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Quantity
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((wine) => {
              const status = getStockStatus(wine.qty);
              return (
                <TableRow
                  className="border-border/50 border-b last:border-0 md:last:border-b flex flex-col md:table-row py-4 md:py-0 relative group"
                  key={wine.id}
                >
                  {/* Name & Mobile secondary info */}
                  <TableCell className="font-medium text-[15px] md:text-sm py-1 md:py-4">
                    <span className="text-primary">{wine.name}</span>

                    {/* Mobile-only details block */}
                    <div className="md:hidden mt-2 flex flex-col gap-2">
                      <span className="text-xs text-muted-foreground font-medium">
                        {wine.vintage} <span className="mx-1">|</span> Qty: {wine.qty}
                      </span>
                      <Badge
                        className={`${status.classes} border-none w-fit px-2 py-0.5 text-[10px]`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Desktop-only columns */}
                  <TableCell className="hidden md:table-cell text-center text-muted-foreground text-sm">
                    {wine.vintage}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center font-medium text-sm">
                    {wine.qty}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center">
                    <Badge className={`${status.classes} border-none`}>{status.label}</Badge>
                  </TableCell>

                  {/* Actions - positioned top-right on mobile, normal cell on desktop */}
                  <TableCell className="text-right absolute right-2 top-4 md:static py-1 md:py-4">
                    <Button
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      size="icon"
                      variant="ghost"
                    >
                      <MoreHorizontal className="h-5 w-5 md:h-4 md:w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            No wines found in this category.
          </div>
>>>>>>> origin/main
        )}
      </div>
    </>
  );
}
