import { MoreHorizontal, Package } from "lucide-react";
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

export function ShopOwnerBundles() {
  // Mock data for shop owner (shows winemaker info)
  const shopBundlesData = [
    {
      id: 1,
      name: "Holiday Red Trio",
      winemaker: "Chateau Montrose",
      creatableQty: 5, // How many the shop can assemble from their specific stock
      price: "€350.00", // Shop retail price
      status: "In Stock",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
    },
    {
      id: 2,
      name: "Bordeaux Discovery Box",
      winemaker: "Multiple Estates",
      creatableQty: 2,
      price: "€180.00",
      status: "Low Stock",
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
    },
  ];

  return (
    <>
      {/* Header Controls */}
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Package class="h-5 w-5" /> Shop Bundles
        </div>
        <div class="flex items-center w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger class="w-full sm:w-[180px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Filter by Winemaker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Winemakers</SelectItem>
              <SelectItem value="montrose">Chateau Montrose</SelectItem>
              <SelectItem value="margaux">Chateau Margaux</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div class="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Bundle Name</TableHead>
              <TableHead class="text-muted-foreground font-medium">Winemaker / Brand</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">
                Available Qty
              </TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">
                Retail Price
              </TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Status</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shopBundlesData.map((bundle) => (
              <TableRow key={bundle.id} class="border-border/50 border-b">
                <TableCell class="font-medium text-sm">{bundle.name}</TableCell>
                <TableCell class="text-muted-foreground text-sm">{bundle.winemaker}</TableCell>
                <TableCell class="text-center font-medium text-sm">{bundle.creatableQty}</TableCell>
                <TableCell class="text-center font-medium text-sm">{bundle.price}</TableCell>
                <TableCell class="text-center">
                  <Badge class={`${bundle.badgeClasses} border-none`}>{bundle.status}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div class="md:hidden flex flex-col">
        {shopBundlesData.map((bundle) => (
          <div
            key={bundle.id}
            class="flex justify-between py-5 border-b border-border/50 last:border-0"
          >
            <div class="flex flex-col gap-1.5 w-full pr-4">
              <span class="font-heading font-semibold text-[15px] truncate">{bundle.name}</span>
              <span class="text-xs text-muted-foreground font-medium truncate">
                {bundle.winemaker}
              </span>
              <div class="flex items-center gap-3 pt-1.5">
                <Badge class={`${bundle.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {bundle.status}
                </Badge>
                <span class="text-xs font-medium text-muted-foreground">
                  Qty: {bundle.creatableQty}
                </span>
                <span class="text-sm font-semibold ml-auto">{bundle.price}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 shrink-0 -mr-2 text-muted-foreground"
            >
              <MoreHorizontal class="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
