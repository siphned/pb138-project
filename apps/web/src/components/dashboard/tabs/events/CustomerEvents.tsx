import {
  Calendar,
  Clock,
  MapPin,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CustomerEvents() {
  const myRegistrations = [
    {
      date: "Wed, Apr 15",
      desc: "You are registered for 2 tickets.",
      id: 1,
      location: "Chateau Montrose Estate",
      time: "6:00 PM - 9:00 PM",
      title: "Grand Vin Vertical Tasting",
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar className="h-5 w-5" /> My Registrations
        </div>
        <Button className="w-full sm:w-auto bg-background rounded-lg h-10 px-5" variant="outline">
          <Search className="h-4 w-4 mr-2" /> Browse Events
        </Button>
      </div>

      <Card className="bg-secondary/40 border-none shadow-none rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-border/50 flex items-center gap-2 font-medium text-primary">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            Upcoming Attendances ({myRegistrations.length})
          </div>

          <div className="flex flex-col">
            {myRegistrations.map((event) => (
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
                      <MapPin className="h-4 w-4" /> {event.location}
                    </span>
                  </div>
                  <p className="text-[14px] font-medium text-primary leading-relaxed max-w-3xl">
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
