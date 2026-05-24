import { Calendar, Clock, MoreHorizontal, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ShopOwnerEvents() {
  const shopEvents = [
    {
      capacity: "12 / 20 registered",
      date: "Fri, May 22",
      desc: "An exclusive guided tasting of recent arrivals hosted at our central Paris location.",
      id: 1,
      time: "7:00 PM - 9:00 PM",
      title: "Chateau Margaux Masterclass",
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar className="h-5 w-5" /> Shop Events
        </div>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <Plus className="h-4 w-4 mr-2" /> Host Tasting
        </Button>
      </div>

      <Card className="bg-secondary/40 border-none shadow-none rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-border/50 flex items-center gap-2 font-medium text-primary">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Upcoming Shop Events ({shopEvents.length})
          </div>

          <div className="flex flex-col">
            {shopEvents.map((event) => (
              <div
                className="p-6 md:p-8 border-b border-border/50 last:border-0 flex justify-between items-start gap-4"
                key={event.id}
              >
                <div className="flex flex-col gap-3 w-full pr-4">
                  <h3 className="font-heading font-semibold text-[17px] text-primary">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {event.capacity}
                    </span>
                  </div>
                  <p className="text-[14px] text-muted-foreground leading-relaxed max-w-3xl">
                    {event.desc}
                  </p>
                </div>
                <Button
                  className="h-8 w-8 text-muted-foreground shrink-0 -mr-2"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
