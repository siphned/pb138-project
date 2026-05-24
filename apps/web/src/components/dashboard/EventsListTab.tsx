import { Calendar01Icon, MoreVerticalIcon, PlusSignIcon } from "hugeicons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusVariant } from "./statusVariant";

const eventsData = [
  {
    attendees: "45 / 50",
    date: "May 15, 2026",
    id: 1,
    location: "Paris, FR",
    name: "Spring Tasting 2026",
    status: "Upcoming",
  },
  {
    attendees: "12 / 20",
    date: "June 02, 2026",
    id: 2,
    location: "Lyon, FR",
    name: "Winemaker Dinner",
    status: "Upcoming",
  },
];

export function EventsListTab() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar01Icon className="h-5 w-5" /> Hosted Events
        </div>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <PlusSignIcon className="h-4 w-4 mr-2" /> Schedule Event
        </Button>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Event Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Date & Location
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Attendees
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsData.map((event) => (
              <TableRow className="border-border/50 border-b" key={event.id}>
                <TableCell className="font-medium text-sm">{event.name}</TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">
                  {event.date} • {event.location}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{event.attendees}</TableCell>
                <TableCell className="text-center">
                  <Badge className="border-none" variant={statusVariant(event.status)}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden flex flex-col">
        {eventsData.map((event) => (
          <div
            className="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
            key={event.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-sm">{event.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {event.date} <span className="mx-1">|</span> {event.location}
              </span>
              <div className="pt-1.5 flex items-center gap-2">
                <Badge className="border-none px-2 py-0.5" variant={statusVariant(event.status)}>
                  {event.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium pl-2 border-l border-border/50">
                  {event.attendees}
                </span>
              </div>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreVerticalIcon className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
