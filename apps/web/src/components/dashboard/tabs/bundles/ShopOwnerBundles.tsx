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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Package className="h-5 w-5" /> Shop Bundles
        </div>
        <div className="flex items-center w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-none rounded-lg h-10">
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
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Bundle Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Winemaker / Brand</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Available Qty
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Retail Price
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
            {shopBundlesData.map((bundle) => (
              <TableRow key={bundle.id} className="border-border/50 border-b">
                <TableCell className="font-medium text-sm">{bundle.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{bundle.winemaker}</TableCell>
                <TableCell className="text-center font-medium text-sm">
                  {bundle.creatableQty}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{bundle.price}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${bundle.badgeClasses} border-none`}>{bundle.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
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
        {shopBundlesData.map((bundle) => (
          <div
            key={bundle.id}
            className="flex justify-between py-5 border-b border-border/50 last:border-0"
          >
            <div className="flex flex-col gap-1.5 w-full pr-4">
              <span className="font-heading font-semibold text-[15px] truncate">{bundle.name}</span>
              <span className="text-xs text-muted-foreground font-medium truncate">
                {bundle.winemaker}
              </span>
              <div className="flex items-center gap-3 pt-1.5">
                <Badge className={`${bundle.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {bundle.status}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  Qty: {bundle.creatableQty}
                </span>
                <span className="text-sm font-semibold ml-auto">{bundle.price}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 -mr-2 text-muted-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
