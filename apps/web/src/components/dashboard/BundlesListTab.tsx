import { MoreVerticalIcon, Package01Icon, PlusSignIcon } from "hugeicons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusVariant } from "./statusVariant";

const bundlesData = [
  { id: 1, items: "3 Bottles", name: "Holiday Red Trio", price: "€120.00", status: "Active" },
  { id: 2, items: "2 Bottles", name: "Summer White Duo", price: "€45.00", status: "Draft" },
];

export function BundlesListTab() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Package01Icon className="h-5 w-5" /> Active Bundles
        </div>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <PlusSignIcon className="h-4 w-4 mr-2" /> Create Bundle
        </Button>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Bundle Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Contents
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
            {bundlesData.map((bundle) => (
              <TableRow className="border-border/50 border-b" key={bundle.id}>
                <TableCell className="font-medium text-sm">{bundle.name}</TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">
                  {bundle.items}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{bundle.price}</TableCell>
                <TableCell className="text-center">
                  <Badge className="border-none" variant={statusVariant(bundle.status)}>
                    {bundle.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden flex flex-col">
        {bundlesData.map((bundle) => (
          <div
            className="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
            key={bundle.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-sm">{bundle.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {bundle.items} <span className="mx-1">|</span> {bundle.price}
              </span>
              <div className="pt-1.5">
                <Badge className="border-none px-2 py-0.5" variant={statusVariant(bundle.status)}>
                  {bundle.status}
                </Badge>
              </div>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreVerticalIcon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
