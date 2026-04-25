import { MoreHorizontal, Plus, Wine } from "lucide-react";
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
import { getStockStatus } from "@/utils/stock";

export function ShopOwnerInventory() {
  const [statusFilter, setStatusFilter] = useState("all");
  const shopData = [
    {
      id: 1,
      name: "Chateau Montrose 2018",
      winemaker: "Chateau Montrose",
      vintage: "2018",
      qty: 24,
    },
    {
      id: 2,
      name: "La Dame de Montrose 2019",
      winemaker: "Chateau Margaux",
      vintage: "2019",
      qty: 8,
    },
  ];

  const filteredData = shopData.filter((wine) => {
    if (statusFilter === "all") return true;
    const status = getStockStatus(wine.qty).label; // "In Stock", "Low Stock", "Out of Stock"
    if (statusFilter === "active") return status === "In Stock";
    return status.toLowerCase().replace(/\s+/g, "") === statusFilter.toLowerCase();
  });
  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine class="h-5 w-5" /> Shop Inventory
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger class="w-full sm:w-40 bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active (In Stock)</SelectItem>
              <SelectItem value="lowstock">Low Stock</SelectItem>
              <SelectItem value="outofstock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus class="h-4 w-4 mr-2" /> Add Wine
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div class="w-full">
        <Table>
          <TableHeader class="hidden md:table-header-group">
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead class="text-muted-foreground font-medium">Winemaker</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Vintage</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Quantity</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Status</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((wine) => {
              const status = getStockStatus(wine.qty);
              return (
                <TableRow
                  key={wine.id}
                  class="border-border/50 border-b last:border-0 md:last:border-b flex flex-col md:table-row py-4 md:py-0 relative group"
                >
                  {/* Name & Mobile secondary info */}
                  <TableCell class="font-medium text-[15px] md:text-sm py-1 md:py-4">
                    <span class="text-primary">{wine.name}</span>

                    {/* Mobile-only details block */}
                    <div class="md:hidden mt-2 flex flex-col gap-2">
                      <span class="text-xs font-medium">{wine.winemaker}</span>
                      <span class="text-xs text-muted-foreground font-medium">
                        {wine.vintage} <span class="mx-1">|</span> Qty: {wine.qty}
                      </span>
                      <Badge class={`${status.classes} border-none w-fit px-2 py-0.5 text-[10px]`}>
                        {status.label}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Desktop-only columns */}
                  <TableCell class="hidden md:table-cell font-medium text-sm">
                    {wine.winemaker}
                  </TableCell>
                  <TableCell class="hidden md:table-cell text-center text-muted-foreground text-sm">
                    {wine.vintage}
                  </TableCell>
                  <TableCell class="hidden md:table-cell text-center font-medium text-sm">
                    {wine.qty}
                  </TableCell>
                  <TableCell class="hidden md:table-cell text-center">
                    <Badge class={`${status.classes} border-none`}>{status.label}</Badge>
                  </TableCell>

                  {/* Actions - positioned top-right on mobile, normal cell on desktop */}
                  <TableCell class="text-right absolute right-2 top-4 md:static py-1 md:py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <MoreHorizontal class="h-5 w-5 md:h-4 md:w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredData.length === 0 && (
          <div class="py-12 text-center text-muted-foreground">
            No wines found in this category.
          </div>
        )}
      </div>
    </>
  );
}
