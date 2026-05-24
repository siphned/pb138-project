import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetWinemakersByIdSuspense } from "@/generated/hooks/useGetWinemakersByIdSuspense";
import { useGetWinemakersMeSuspense } from "@/generated/hooks/useGetWinemakersMeSuspense";
import { usePatchWinemakersMe } from "@/generated/hooks/usePatchWinemakersMe";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/winemakers/$id/edit")({
  component: WinemakerEditPage,
});

const schema = z.object({
  description: z.string().min(1, "Description is required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

function StatusMessage({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div
      className={cn(
        "rounded-md p-4",
        type === "success"
          ? "border border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200"
          : "border border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      )}
    >
      {message}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-4 px-6 py-24 text-center lg:px-12">
      <h2 className="text-xl font-semibold">Access Denied</h2>
      <p className="text-muted-foreground">You can only edit your own winemaker profile.</p>
    </div>
  );
}

function WinemakerEditContent({ id }: { id: string }) {
  const { data: me } = useGetWinemakersMeSuspense();
  const { data: winemaker } = useGetWinemakersByIdSuspense(id);

  if (!me || (me as { id?: string }).id !== id) {
    return <AccessDenied />;
  }

  return <WinemakerEditForm id={id} winemaker={winemaker as Record<string, unknown>} />;
}

function WinemakerEditForm({ id, winemaker }: { id: string; winemaker: Record<string, unknown> }) {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const mutation = usePatchWinemakersMe({
    mutation: {
      onError: (error) => {
        setStatusMessage({
          message: (error as Error).message || "Failed to update profile",
          type: "error",
        });
      },
      onSuccess: () => {
        setStatusMessage({ message: "Profile updated successfully!", type: "success" });
        setTimeout(() => navigate({ to: `/winemakers/${id}` }), 1500);
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      description: (winemaker.description as string) ?? "",
      email: (winemaker.email as string) ?? "",
      name: (winemaker.name as string) ?? "",
      phone: (winemaker.phone as string) ?? "",
      websiteUrl: (winemaker.websiteUrl as string) ?? "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    mutation.mutate({
      data: {
        description: values.description,
        email: values.email || undefined,
        name: values.name,
        phone: values.phone || undefined,
        websiteUrl: values.websiteUrl || null,
      },
    });
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Update your winemaker profile information." title="Edit Profile" />

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            className="resize-none"
            id="description"
            rows={4}
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <Input id="websiteUrl" placeholder="https://..." type="url" {...register("websiteUrl")} />
          {errors.websiteUrl && (
            <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
          )}
        </div>

        {statusMessage && (
          <StatusMessage message={statusMessage.message} type={statusMessage.type} />
        )}

        <div className="flex gap-3">
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={() => navigate({ to: `/winemakers/${id}` })}
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

function WinemakerEditPage() {
  const { id } = Route.useParams();

  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-2xl space-y-8 px-6 py-8 lg:px-12">
          <PageHeader title="Edit Profile" />
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton className="h-12 w-full" key={i} />
            ))}
          </div>
        </div>
      }
    >
      <WinemakerEditContent id={id} />
    </Suspense>
  );
}
