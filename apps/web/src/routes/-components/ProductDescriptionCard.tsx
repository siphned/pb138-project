import { Card } from "@/components/ui/card";

interface ProductDescriptionCardProps {
  description: string;
  isBundle: boolean;
}

export function ProductDescriptionCard({ description, isBundle }: ProductDescriptionCardProps) {
  return (
    <Card className="rounded-2xl border-none bg-secondary/10 p-6 shadow-none">
      <h3 className="font-heading text-lg font-bold mb-2">
        {isBundle ? "About this Bundle" : "About this Wine"}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
}
