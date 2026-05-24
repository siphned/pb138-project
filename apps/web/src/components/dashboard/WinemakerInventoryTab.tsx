import { DrinkIcon, MoreHorizontalIcon, PlusSignIcon } from "hugeicons-react";
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
import { statusVariant } from "./statusVariant";

const inventoryData = [
  { id: 1, name: "Chateau Montrose 2018", qty: 245, status: "In Stock", vintage: "2018" },
  { id: 2, name: "La Dame de Montrose 2019", qty: 8, status: "Low Stock", vintage: "2019" },
  { id: 3, name: "Tertio de Montrose 2020", qty: 0, status: "Out of Stock", vintage: "2020" },
  { id: 4, name: "Montrose Rose 2021", qty: 156, status: "In Stock", vintage: "2021" },
];

export function WinemakerInventoryTab() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <DrinkIcon className="h-5 w-5" /> My Wines
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[120px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="white">White</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <PlusSignIcon className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
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
            {inventoryData.map((wine) => (
              <TableRow className="border-border/50 border-b" key={wine.id}>
                <TableCell className="font-medium text-sm">{wine.name}</TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">
                  {wine.vintage}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{wine.qty}</TableCell>
                <TableCell className="text-center">
                  <Badge className="border-none" variant={statusVariant(wine.status)}>
                    {wine.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Hidden on Desktop) --- */}
      <div className="block md:hidden flex flex-col">
        {inventoryData.map((wine) => (
          <div
            className="flex justify-between py-5 border-b border-border/50 last:border-0"
            key={wine.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-sm">{wine.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {wine.vintage} <span className="mx-1">|</span> Qty: {wine.qty}
              </span>
              <div className="pt-1.5">
                <Badge className="border-none px-2 py-0.5" variant={statusVariant(wine.status)}>
                  {wine.status}
                </Badge>
              </div>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreHorizontalIcon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
