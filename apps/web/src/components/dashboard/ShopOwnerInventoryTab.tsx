import { MoreHorizontal, Plus, Wine } from "lucide-react";
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

const shopData = [
  {
    id: 1,
    name: "Chateau Montrose 2018",
    qty: 24,
    winemaker: "Chateau Montrose",
  },
  {
    id: 2,
    name: "La Dame de Montrose 2019",
    qty: 8,
    winemaker: "Chateau Montrose",
  },
];

export function ShopOwnerInventoryTab() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine className="h-5 w-5" /> Shop Inventory
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Select Winemaker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Winemakers</SelectItem>
              <SelectItem value="montrose">Chateau Montrose</SelectItem>
              <SelectItem value="margaux">Chateau Margaux</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus className="h-4 w-4 mr-2" /> Add Wine
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Winemaker</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                In Shop
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shopData.map((wine) => (
              <TableRow className="border-border/50 border-b" key={wine.id}>
                <TableCell className="font-medium text-sm">{wine.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{wine.winemaker}</TableCell>
                <TableCell className="text-center font-medium text-sm">{wine.qty}</TableCell>
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
      <div className="block md:hidden flex flex-col">
        {shopData.map((wine) => (
          <div
            className="flex justify-between py-5 border-b border-border/50 last:border-0"
            key={wine.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-sm">{wine.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {wine.winemaker} <span className="mx-1">|</span> Qty: {wine.qty}
              </span>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
