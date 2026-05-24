import { Card } from "@/components/ui/card";
import { ShopHoursDisplay } from "./ShopHoursDisplay";

interface ShopContactCardProps {
  shopId: string;
  // TODO: Add phone and email once backend supports them in GET /shops/:id
  phone?: string;
  email?: string;
}

export function ShopContactCard({ shopId, phone, email }: ShopContactCardProps) {
  return (
    <Card className="lg:sticky lg:top-8 rounded-2xl p-6 border-none bg-secondary/10 shadow-none">
      <h3 className="font-heading text-xl font-bold mb-0">Contact & Hours</h3>
      <div className="space-y-4 text-sm">
        <div className="sm:flex-col md:grid grid-cols-2">
          <div>
            <p className="font-semibold text-muted-foreground mb-0 leading-none font-heading tracking-wider">
              Phone
            </p>
            <p>{phone ?? "+420 123 456 789"}</p>
          </div>
          <div>
            <p className="font-semibold text-muted-foreground mb-0 leading-none font-heading tracking-wider">
              Email
            </p>
            <p>{email ?? "example.email@example.com"}</p>
          </div>
        </div>
        <div>
          <p className="font-semibold text-muted-foreground mb-1 leading-none font-heading tracking-wider">
            Opening Hours
          </p>
          <ShopHoursDisplay shopId={shopId} />
        </div>
      </div>
    </Card>
  );
}
