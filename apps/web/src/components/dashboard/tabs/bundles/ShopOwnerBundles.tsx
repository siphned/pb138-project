import { AlertTriangle, Loader2, MoreHorizontal, Package } from "lucide-react";
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
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { getStockStatus } from "@/utils/stock";

export function ShopOwnerBundles() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: shops, isLoading: shopsLoading, isError: shopsError } = useGetShopsMe();
  const shopId = shops?.[0]?.id;

  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProducts({ isBundle: true, shopId: shopId ?? "" }, { enabled: !!shopId });

  const isLoading = shopsLoading || (!!shopId && productsLoading);
  const isError = shopsError || productsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading bundles...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
        <AlertTriangle className="h-8 w-8" />
        <p className="font-medium">Failed to load bundles</p>
        <p className="text-sm text-muted-foreground">Please try again later.</p>
      </div>
    );
  }

  if (!shops || shops.length === 0) {
    return (
      <>
        <h3 className="text-lg font-semibold mb-4">Shop Bundles</h3>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No shop yet</h3>
          <p className="text-muted-foreground">Create a shop to manage bundles.</p>
        </div>
      </>
    );
  }

  const bundles = products?.data ?? [];

  const filteredBundles = bundles.filter((bundle) => {
    if (statusFilter === "all") return true;
    const qty = Number(bundle.quantity);
    const status = getStockStatus(qty).label;
    if (statusFilter === "active") return status === "In Stock";
    return status.toLowerCase().replace(/\s+/g, "") === statusFilter.toLowerCase();
  });

  const bundleWinery = (wines: (typeof bundles)[number]["wines"]) =>
    wines[0]?.winemaker?.name ?? "—";
  const bundleWines = (wines: (typeof bundles)[number]["wines"]) =>
    wines.map((w) => w.name).join(", ");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Shop Bundles</h3>
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
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bundle Name</TableHead>
              <TableHead>Winemaker</TableHead>
              <TableHead>Contents</TableHead>
              <TableHead className="text-right">Available Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBundles.length === 0 ? (
              <TableRow>
                <TableCell className="text-center text-muted-foreground py-8" colSpan={7}>
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
                    <TableCell>{bundleWinery(bundle.wines)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
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
                <p className="text-sm text-muted-foreground">{bundleWinery(bundle.wines)}</p>
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
      </div>
    </>
  );
}
