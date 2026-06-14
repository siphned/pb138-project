import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";

interface ShopSelectorProps {
  value: string | "all";
  onChange: (value: string | "all") => void;
}

export function ShopSelector({ value, onChange }: ShopSelectorProps) {
  const { data } = useGetShopsMe();
  const shops = Array.isArray(data) ? data : [];

  if (shops.length === 0) return null;

  const labelFor = (v: string | null) => {
    if (!v || v === "all") return "All shops";
    return shops.find((s) => s.id === v)?.name ?? v;
  };

  return (
    <Select onValueChange={(v) => v && onChange(v)} value={value}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select a shop">{(v: string | null) => labelFor(v)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All shops</SelectItem>
        {shops.map((shop) => (
          <SelectItem key={shop.id} value={shop.id}>
            {shop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
