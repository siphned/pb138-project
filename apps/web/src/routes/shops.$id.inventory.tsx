import { ArrowLeft02Icon, Edit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createFileRoute,
  Link,
  Outlet,
  useChildMatches,
  useNavigate,
} from "@tanstack/react-router";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

function parseIsBundle(v: unknown): boolean | undefined {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return undefined;
}

interface ShopInventorySearch {
  isBundle?: boolean;
}

export const Route = createFileRoute("/shops/$id/inventory")({
  component: ShopInventoryPage,
  validateSearch: (search): ShopInventorySearch => {
    const value = parseIsBundle((search as { isBundle?: unknown }).isBundle);
    return value === undefined ? {} : { isBundle: value };
  },
});

interface ProductRow {
  id: string;
  name: string;
  price?: string | number;
  quantity?: number;
  isBundle?: boolean;
}

function ShopInventoryPage() {
  const { id } = Route.useParams();
  const { isBundle } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  // This route file doubles as the layout for its children (/new,
  // /$productId/edit). When the URL targets a child route, render the Outlet so
  // the child component takes over instead of the list page.
  const hasChildRoute = useChildMatches().length > 0;
  if (hasChildRoute) return <Outlet />;

  const query = useGetShopsByIdProducts(id, {
    isBundle,
  });

  const list = ((query.data as { data?: ProductRow[] } | undefined)?.data ?? []) as ProductRow[];

  const filterValue: "all" | "products" | "bundles" =
    isBundle === undefined ? "all" : isBundle ? "bundles" : "products";

  const onFilterChange = (v: string | null) => {
    if (!v) return;
    if (v === "all") navigate({ search: { isBundle: undefined } });
    else if (v === "bundles") navigate({ search: { isBundle: true } });
    else navigate({ search: { isBundle: false } });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/shops/$id"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to shop
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader description="Products and bundles you sell in this shop." title="Inventory" />
        <Button
          render={
            <Link
              params={{ id }}
              search={{ isBundle: undefined }}
              to="/shops/$id/inventory/new"
            />
          }
        >
          + Add product
        </Button>
      </div>

      <div className="flex justify-end">
        <Select onValueChange={onFilterChange} value={filterValue}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All items</SelectItem>
            <SelectItem value="products">Single products</SelectItem>
            <SelectItem value="bundles">Bundles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Section heading={`Items (${list.length})`}>
        {query.isLoading ? (
          <LoadingState variant="list" />
        ) : query.isError ? (
          <ErrorState
            message="Could not load this shop's inventory."
            onRetry={() => query.refetch()}
            title="Failed to load"
          />
        ) : list.length === 0 ? (
          <EmptyState description="Add products or bundles to start selling." title="No items yet" />
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border">
            {list.map((p) => (
              <li className="flex items-center justify-between gap-4 p-4" key={p.id}>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      className="font-medium text-foreground hover:text-primary"
                      params={{ productId: p.id }}
                      to="/products/$productId"
                    >
                      {p.name}
                    </Link>
                    {p.isBundle && <Badge variant="outline">Bundle</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {p.quantity !== undefined ? `${p.quantity} in stock` : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.price !== undefined && (
                    <span className="font-medium text-foreground">€{p.price}</span>
                  )}
                  <Button
                    aria-label={`Edit ${p.name}`}
                    render={
                      <Link
                        params={{ id, productId: p.id }}
                        search={{ isBundle: undefined }}
                        to="/shops/$id/inventory/$productId/edit"
                      />
                    }
                    size="icon"
                    variant="ghost"
                  >
                    <HugeiconsIcon className="h-4 w-4" icon={Edit01Icon} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
