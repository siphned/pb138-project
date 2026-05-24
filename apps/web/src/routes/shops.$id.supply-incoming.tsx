import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetSupplyAgreementsWinemaker } from "@/generated/hooks/useGetSupplyAgreementsWinemaker";
import { usePatchSupplyAgreementsById } from "@/generated/hooks/usePatchSupplyAgreementsById";

export const Route = createFileRoute("/shops/$id/supply-incoming")({
  component: SupplyIncomingPage,
});

function statusBadgeClass(status: string) {
  if (status === "approved") return "bg-green-100/30 text-green-700 dark:text-green-400";
  if (status === "rejected") return "bg-destructive/30 text-destructive";
  return "bg-yellow-100/30 text-yellow-700 dark:text-yellow-400";
}

// biome-ignore lint/suspicious/noExplicitAny: API response is untyped
type Agreement = Record<string, any>;

function SupplyIncomingPage() {
  const { data, isLoading, isError, refetch } = useGetSupplyAgreementsWinemaker();
  const patchMutation = usePatchSupplyAgreementsById();

  const agreements = Array.isArray(data) ? (data as Agreement[]) : [];

  const handleAction = (agreementId: string, status: "approved" | "rejected") => {
    patchMutation.mutate({ data: { status }, id: agreementId }, { onSuccess: () => refetch() });
  };

  if (isError) {
    return (
      <div className="container mx-auto max-w-5xl px-6 py-8 lg:px-12">
        <h1 className="mb-4 text-2xl font-bold">Incoming Supply Requests</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load supply requests.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-6 py-8 lg:px-12">
      <h1 className="text-2xl font-bold">Incoming Supply Requests</h1>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className="h-14 w-full" key={i} />
          ))}
        </div>
      )}
      {!isLoading && agreements.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <p className="text-muted-foreground">No incoming supply requests.</p>
        </div>
      )}
      {!isLoading && agreements.length > 0 && (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-sm">{a.shopId}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeClass(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {a.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          disabled={patchMutation.isPending}
                          onClick={() => handleAction(a.id, "approved")}
                          size="sm"
                        >
                          Approve
                        </Button>
                        <Button
                          disabled={patchMutation.isPending}
                          onClick={() => handleAction(a.id, "rejected")}
                          size="sm"
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
