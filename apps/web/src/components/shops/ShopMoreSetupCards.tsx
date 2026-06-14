import { ArrowRight01Icon, Calendar03Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Section } from "@/components/primitives/section";
import { Card, CardContent } from "@/components/ui/card";

interface ShopMoreSetupCardsProps {
  shopId: string;
  /** Section heading shown above the cards. Defaults to "More setup". */
  heading?: string;
}

/**
 * Two-card grid linking to the shop's images and availability pages. Used on
 * both the edit page and the post-create success state of the new shop page.
 */
export function ShopMoreSetupCards({ shopId, heading = "More setup" }: ShopMoreSetupCardsProps) {
  return (
    <Section heading={heading}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link params={{ id: shopId }} to="/shops/$id/images">
          <Card className="transition-colors hover:border-primary" variant="section">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon className="h-5 w-5" icon={Image01Icon} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Manage images</h3>
                <p className="text-sm text-muted-foreground">
                  Upload photos so customers recognise your shop.
                </p>
              </div>
              <HugeiconsIcon
                className="mt-2 h-4 w-4 shrink-0 text-muted-foreground"
                icon={ArrowRight01Icon}
              />
            </CardContent>
          </Card>
        </Link>

        <Link params={{ id: shopId }} to="/shops/$id/availability">
          <Card className="transition-colors hover:border-primary" variant="section">
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HugeiconsIcon className="h-5 w-5" icon={Calendar03Icon} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Opening hours</h3>
                <p className="text-sm text-muted-foreground">
                  Set your regular weekly hours and any exceptions.
                </p>
              </div>
              <HugeiconsIcon
                className="mt-2 h-4 w-4 shrink-0 text-muted-foreground"
                icon={ArrowRight01Icon}
              />
            </CardContent>
          </Card>
        </Link>
      </div>
    </Section>
  );
}
