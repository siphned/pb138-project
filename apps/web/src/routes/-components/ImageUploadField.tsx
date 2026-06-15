import { useState } from "react";
import { FormControl, FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/avif";
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;

interface ImageUploadFieldProps {
  /** Callback fired whenever the user selects a valid set of files. */
  onFilesChange: (files: File[]) => void;
  /** Callback fired with a non-null message when validation fails, or null when cleared. */
  onErrorChange?: (message: string | null) => void;
  label?: string;
  description?: string;
}

/**
 * Multi-file image picker with 10 MB per-file cap. Stateless w.r.t. the form —
 * the parent owns the resulting `File[]` and uploads them after the create
 * mutation succeeds (see events.new.tsx, BundleForm.tsx for usage).
 */
export function ImageUploadField({
  onFilesChange,
  onErrorChange,
  label = "Images (Optional)",
  description = "PNG, JPEG, WebP, or AVIF up to 10 MB each.",
}: ImageUploadFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const oversize = files.find((f) => f.size > IMAGE_MAX_BYTES);
    if (oversize) {
      const msg = `${oversize.name} is too large (max ${IMAGE_MAX_BYTES / 1024 / 1024} MB).`;
      setError(msg);
      onErrorChange?.(msg);
      onFilesChange([]);
      return;
    }
    setError(null);
    onErrorChange?.(null);
    onFilesChange(files);
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input accept={IMAGE_ACCEPT} multiple onChange={handleChange} type="file" />
      </FormControl>
      <FormDescription>{description}</FormDescription>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </FormItem>
  );
}
