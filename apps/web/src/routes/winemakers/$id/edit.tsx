import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getWinemakersQueryKey } from "@/generated/hooks/useGetWinemakers";
import {
  getWinemakersByIdQueryKey,
  useGetWinemakersById,
} from "@/generated/hooks/useGetWinemakersById";
import { usePatchWinemakersById } from "@/generated/hooks/usePatchWinemakersById";

export const Route = createFileRoute("/winemakers/$id/edit")({
  component: WinemakerEditPage,
});

type WinemakerEditFormValues = {
  description: string;
  email: string;
  name: string;
  phone: string;
  websiteUrl: string;
};

function WinemakerEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: winemaker, isLoading, isError, refetch } = useGetWinemakersById(id);
  const mutation = usePatchWinemakersById();

  const form = useForm<WinemakerEditFormValues>({
    values: {
      description: winemaker?.description ?? "",
      email: winemaker?.email ?? "",
      name: winemaker?.name ?? "",
      phone: winemaker?.phone ?? "",
      websiteUrl: winemaker?.websiteUrl ?? "",
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !winemaker) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't load the winemaker profile to edit."
          onRetry={() => refetch()}
          title="Winemaker not found"
        />
      </div>
    );
  }

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(
      {
        data: {
          description: values.description || undefined,
          email: values.email || undefined,
          name: values.name || undefined,
          phone: values.phone || undefined,
          websiteUrl: values.websiteUrl || null,
        },
        id,
      },
      {
        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: getWinemakersByIdQueryKey(id) }),
            queryClient.invalidateQueries({ queryKey: getWinemakersQueryKey() }),
          ]);
          navigate({ params: { id }, to: "/winemakers/$id" });
        },
      }
    );
  });

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        to="/winemakers/$id"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to winemaker
      </Link>

      <PageHeader
        description="Update your winery's public profile."
        title="Edit winemaker profile"
      />

      <form className="max-w-2xl space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold">Basic information</h2>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...form.register("description")} />
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="font-semibold">Contact</h2>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...form.register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input id="websiteUrl" type="url" {...form.register("websiteUrl")} />
          </div>
        </div>

        <div className="flex gap-4">
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            onClick={() => navigate({ params: { id }, to: "/winemakers/$id" })}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
