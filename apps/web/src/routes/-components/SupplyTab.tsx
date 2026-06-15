"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSupplyAgreementsShopByShopId } from "@/generated/hooks/useGetSupplyAgreementsShopByShopId";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { usePostSupplyAgreements } from "@/generated/hooks/usePostSupplyAgreements";

interface SupplyTabProps {
  shopId: string;
}

type SupplyStatus = "pending" | "active" | "expired" | "rejected";

const statusColors: Record<SupplyStatus, string> = {
  active: "bg-green-100/30 text-green-700 dark:text-green-400",
  expired: "bg-gray-100/30 text-gray-700 dark:text-gray-400",
  pending: "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400",
  rejected: "bg-destructive/30 text-destructive dark:text-red-400",
};

export function SupplyTab({ shopId }: SupplyTabProps) {
  const { data: agreements, isLoading, error } = useGetSupplyAgreementsShopByShopId(shopId);
  const { data: winemakers, isLoading: winemakersLoading } = useGetWinemakers();
  const createAgreementMutation = usePostSupplyAgreements();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedWinemaker, setSelectedWinemaker] = useState<string>("");

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const supplyAgreements = (agreements || []) as any[];
  // GET /winemakers returns a paginated envelope ({ data, total, ... }), not a
  // bare array — unwrap .data so the winemaker list actually renders.
  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const winemakersData = (
    Array.isArray(winemakers) ? winemakers : ((winemakers as { data?: any[] })?.data ?? [])
  ) as any[];

  const handleCreateAgreement = async () => {
    if (!selectedWinemaker) return;

    try {
      await createAgreementMutation.mutateAsync({
        data: {
          shopId,
          winemakerId: selectedWinemaker,
        },
      });
      setSelectedWinemaker("");
      setIsSheetOpen(false);
    } catch {
      // Error is handled by mutation error state
    }
  };

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle>Supply Agreements</CardTitle>
          <CardDescription>Manage your supply agreements with winemakers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-destructive/10 p-4 text-destructive">
            Failed to load supply agreements:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Active Supply Agreements</CardTitle>
            <CardDescription>Manage your supply agreements with winemakers</CardDescription>
          </div>
          <Button className="gap-2" onClick={() => setIsSheetOpen(true)}>
            <span className="h-4 w-4">+</span>
            New Agreement
          </Button>
        </CardHeader>

        <CardContent>
          {(() => {
            if (isLoading) {
              return (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton className="h-12 w-full" key={i} />
                  ))}
                </div>
              );
            }
            if (supplyAgreements.length === 0) {
              return (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No active supply agreements yet</p>
                  <Button className="gap-2" onClick={() => setIsSheetOpen(true)} variant="outline">
                    <span className="h-4 w-4">+</span>
                    Create your first agreement
                  </Button>
                </div>
              );
            }
            return (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Winemaker</TableHead>
                      <TableHead>Wine</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplyAgreements.map((agreement) => {
                      const status = (agreement.status || "pending").toLowerCase() as SupplyStatus;

                      return (
                        <TableRow key={agreement.id}>
                          <TableCell className="font-medium">{agreement.winemakerId}</TableCell>
                          <TableCell className="text-sm">—</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                statusColors[status] || statusColors.pending
                              }`}
                            >
                              {status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(agreement.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {agreement.respondedAt
                              ? new Date(agreement.respondedAt).toLocaleDateString()
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* New Supply Agreement Sheet */}
      <Sheet onOpenChange={(open) => setIsSheetOpen(open)} open={isSheetOpen}>
        <SheetContent className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Create Supply Agreement</SheetTitle>
            <SheetDescription>Propose a new supply agreement with a winemaker</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Select Winemaker</p>
              <Select
                onValueChange={(v) => v && setSelectedWinemaker(v)}
                value={selectedWinemaker || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a winemaker..." />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (winemakersLoading) {
                      return (
                        <SelectItem disabled value="">
                          Loading winemakers...
                        </SelectItem>
                      );
                    }
                    if (winemakersData.length === 0) {
                      return (
                        <SelectItem disabled value="">
                          No winemakers available
                        </SelectItem>
                      );
                    }
                    return winemakersData.map((winemaker) => (
                      <SelectItem key={winemaker.id} value={winemaker.id}>
                        {winemaker.name || winemaker.id}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the winemaker you want to create a supply agreement with
              </p>
            </div>

            <div className="rounded-md bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Once you create an agreement, the winemaker will receive a request. You can
                negotiate terms directly with them once they accept.
              </p>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setIsSheetOpen(false)} variant="outline">
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                disabled={!selectedWinemaker || createAgreementMutation.isPending}
                onClick={handleCreateAgreement}
              >
                {createAgreementMutation.isPending && (
                  <span className="h-4 w-4 animate-spin inline-block">⏳</span>
                )}
                Create Agreement
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
