"use client";

import { Cancel01Icon, PencilIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteShopsByIdProductsByProductId } from "@/generated/hooks/useDeleteShopsByIdProductsByProductId";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

interface InventoryTabProps {
  shopId: string;
}

export function InventoryTab({ shopId }: InventoryTabProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetShopsByIdProducts(shopId);
  const deleteProductMutation = useDeleteShopsByIdProductsByProductId();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const products = data?.data || [];

  const handleAddProduct = () => {
    navigate({
      params: { id: shopId },
      search: { isBundle: undefined },
      to: "/shops/$id/inventory/new",
    });
  };

  const handleEditProduct = (productId: string) => {
    navigate({
      params: { id: shopId, productId },
      search: { isBundle: undefined },
      to: "/shops/$id/inventory/$productId/edit",
    });
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductMutation.mutateAsync({
        id: shopId,
        productId,
      });
      setDeleteConfirm(null);
    } catch {
      // Error is handled by mutation error state
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>Manage your shop products and stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            Failed to load inventory: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Inventory Management</CardTitle>
            <CardDescription>Manage your shop products and stock</CardDescription>
          </div>
          <Button className="gap-2" onClick={handleAddProduct}>
            <span className="h-4 w-4">+</span>
            Add Product
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton className="h-12 w-full" key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No products in your inventory yet</p>
              <Button className="gap-2" onClick={handleAddProduct} variant="outline">
                <span className="h-4 w-4">+</span>
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Wine</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const qty = Number(product.quantity);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-sm">{product.wines?.[0]?.name || "—"}</TableCell>
                        <TableCell className="font-mono">${product.price}</TableCell>
                        <TableCell className="text-sm">
                          <span
                            className={(() => {
                              if (qty > 10) return "text-green-600 dark:text-green-400";
                              if (qty > 0) return "text-yellow-600 dark:text-yellow-400";
                              return "text-destructive";
                            })()}
                          >
                            {product.quantity} units
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              qty > 0
                                ? "bg-green-100/30 text-green-700 dark:text-green-400"
                                : "bg-destructive/30 text-destructive dark:text-red-400"
                            }`}
                          >
                            {qty > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditProduct(product.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <HugeiconsIcon icon={PencilIcon} strokeWidth={2} />
                            </Button>
                            <Button
                              className="h-8 w-8 p-0 hover:text-destructive"
                              onClick={() => setDeleteConfirm(product.id)}
                              size="sm"
                              variant="ghost"
                            >
                              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        open={deleteConfirm !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProductMutation.isPending}
              onClick={() => deleteConfirm && handleDeleteProduct(deleteConfirm)}
            >
              {deleteProductMutation.isPending && (
                <span className="h-4 w-4 mr-2 animate-spin inline-block">⏳</span>
              )}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
