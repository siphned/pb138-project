import { Calendar, CheckCircle2, Clock, Clock4, MoreVertical, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function WinemakerEvents() {
  const upcomingEvents = [
    {
      id: 1,
      title: "Grand Vin Vertical Tasting",
      approvalStatus: "Approved",
      date: "Wed, Apr 15",
      time: "6:00 PM - 9:00 PM",
      capacity: "15 / 15 registered",
      desc: "Join us for an exclusive tasting of our Grand Vin across five exceptional vintages.",
    },
    {
      id: 2,
      title: "Spring Wine & Food Pairing",
      approvalStatus: "Pending Approval",
      date: "Tue, Apr 28",
      time: "7:00 PM - 10:00 PM",
      capacity: "0 / 42 registered",
      desc: "Discover perfect pairings with seasonal cuisine from our guest chef.",
    },
    {
      id: 3,
      title: "Winemaker Dinner",
      approvalStatus: "Approved",
      date: "Sun, May 10",
      time: "6:30 PM - 10:30 PM",
      capacity: "54 / 210 registered",
      desc: "An intimate dinner with our head winemaker featuring rare library selections.",
    },
  ];

  const pastEvents = [
    {
      id: 4,
      title: "Holiday Tasting Event 2025",
      date: "Sun, May 10",
      time: "6:30 PM - 10:30 PM",
      capacity: "210 registered",
    },
  ];

  // Helper function to render the exact badges from your Figma
  const renderApprovalBadge = (status: string) => {
    if (status === "Approved") {
      return (
        <Badge
          variant="outline"
          className="border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] hover:bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-medium rounded"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] hover:bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-medium rounded"
      >
        <Clock4 className="w-3 h-3 mr-1" /> Pending Approval
      </Badge>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar className="h-5 w-5" /> Tasting Events
        </div>
        <Button className="w-full sm:w-auto bg-[#8B2E3D] hover:bg-[#8B2E3D]/90 text-white rounded-lg h-10 px-5">
          <Plus className="h-4 w-4 mr-2" /> Schedule Event
        </Button>
      </div>

      {/* Upcoming Events Card */}
      <Card className="bg-[#EFEAE8]/50 border-none shadow-none rounded-[24px] overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-5 md:px-8 md:py-6 border-b border-[#E5DFDD] flex items-center gap-2 font-medium text-primary">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            Upcoming Events ({upcomingEvents.length})
          </div>

          <div className="flex flex-col">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="p-6 md:p-8 border-b border-[#E5DFDD] last:border-0 flex justify-between items-start gap-4"
              >
                <div className="flex flex-col gap-3 w-full pr-4">
                  {/* Title and Badge Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h3 className="font-heading font-semibold text-[16px] text-primary">
                      {event.title}
                    </h3>
                    <div className="inline-flex">{renderApprovalBadge(event.approvalStatus)}</div>
                  </div>

                  {/* Meta Information Row */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="h-3.5 w-3.5" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Clock className="h-3.5 w-3.5" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                      <Users className="h-3.5 w-3.5" /> {event.capacity}
                    </span>
                  </div>

                  <p className="text-[13px] text-muted-foreground leading-relaxed max-w-3xl mt-1">
                    {event.desc}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground shrink-0 -mr-2"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Events Card */}
      <Card className="bg-[#EFEAE8]/30 border-none shadow-none rounded-[24px] overflow-hidden mt-6">
        <CardContent className="p-0">
          <div className="px-6 py-5 md:px-8 md:py-6 text-muted-foreground font-medium text-[15px]">
            Past Events ({pastEvents.length})
          </div>

          <div className="flex flex-col">
            {pastEvents.map((event) => (
              <div key={event.id} className="p-6 md:p-8 flex justify-between items-center gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className="font-heading font-medium text-[15px] text-muted-foreground">
                    {event.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground/70">
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Calendar className="h-3.5 w-3.5" /> {event.date}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <Clock className="h-3.5 w-3.5" /> {event.time}
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto mt-1 sm:mt-0">
                      <Users className="h-3.5 w-3.5" /> {event.capacity}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-medium text-muted-foreground shrink-0 bg-background/50 px-2 py-1 rounded">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
