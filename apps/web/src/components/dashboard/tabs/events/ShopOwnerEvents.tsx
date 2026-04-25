import { Calendar, Clock, MoreHorizontal, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ShopOwnerEvents() {
  const shopEvents = [
    {
      id: 1,
      title: "Chateau Margaux Masterclass",
      date: "Fri, May 22",
      time: "7:00 PM - 9:00 PM",
      capacity: "12 / 20 registered",
      desc: "An exclusive guided tasting of recent arrivals hosted at our central Paris location.",
    },
  ];

  return (
    <>
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar class="h-5 w-5" /> Shop Events
        </div>
        <Button class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <Plus class="h-4 w-4 mr-2" /> Host Tasting
        </Button>
      </div>

      <Card class="bg-secondary/40 border-none shadow-none rounded-3xl overflow-hidden">
        <CardContent class="p-0">
          <div class="px-6 py-5 md:px-8 md:py-6 border-b border-border/50 flex items-center gap-2 font-medium text-primary">
            <div class="w-2 h-2 rounded-full bg-emerald-500" />
            Upcoming Shop Events ({shopEvents.length})
          </div>

          <div class="flex flex-col">
            {shopEvents.map((event) => (
              <div
                key={event.id}
                class="p-6 md:p-8 border-b border-border/50 last:border-0 flex justify-between items-start gap-4"
              >
                <div class="flex flex-col gap-3 w-full pr-4">
                  <h3 class="font-heading font-semibold text-[17px] text-primary">{event.title}</h3>
                  <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground font-medium">
                    <span class="flex items-center gap-1.5">
                      <Calendar class="h-4 w-4" /> {event.date}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <Clock class="h-4 w-4" /> {event.time}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <Users class="h-4 w-4" /> {event.capacity}
                    </span>
                  </div>
                  <p class="text-[14px] text-muted-foreground leading-relaxed max-w-3xl">
                    {event.desc}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-muted-foreground shrink-0 -mr-2"
                >
                  <MoreHorizontal class="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
