import { AlertTriangle, Loader2, MoreHorizontal, Plus, Wine } from "lucide-react";
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
import { useGetWines } from "@/generated/hooks/useGetWines";
import { getStockStatus } from "@/utils/stock";

export function WinemakerInventory() {
  const [statusFilter, setStatusFilter] = useState("all");

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
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading wines...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
        <AlertTriangle className="h-8 w-8" />
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
          <Wine className="h-12 w-12 text-muted-foreground mb-4" />
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
    if (statusFilter === "active") return status === "In Stock";
    return status.toLowerCase().replace(/\s+/g, "") === statusFilter.toLowerCase();
  });

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Wines</h3>
        <div className="flex items-center gap-2">
          <Select onValueChange={setStatusFilter} value={statusFilter}>
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
            <Plus className="mr-1 h-4 w-4" /> Add Wine
          </Button>
        </div>
      </div>

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
                        <MoreHorizontal className="h-4 w-4" />
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
        )}
      </div>
    </>
  );
}
