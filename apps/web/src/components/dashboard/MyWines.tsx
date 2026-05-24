<<<<<<< HEAD
import { DrinkIcon, ShoppingBag01Icon } from "hugeicons-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BundlesListTab } from "./BundlesListTab";
import { CustomerOrderHistoryTab } from "./CustomerOrderHistoryTab";
import { EventsListTab } from "./EventsListTab";
import { ShopOwnerInventoryTab } from "./ShopOwnerInventoryTab";
import { WinemakerInventoryTab } from "./WinemakerInventoryTab";
=======
import {
  ArrowUpRight,
  Calendar,
  MoreHorizontal,
  Package,
  Plus,
  ShoppingBag,
  Wine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
>>>>>>> origin/main

interface MyWinesProps {
  role?: "Winemaker" | "Shop Owner" | "Customer" | string;
}

export function MyWines({ role = "Winemaker" }: MyWinesProps) {
<<<<<<< HEAD
  let mainTab = <WinemakerInventoryTab />;
  if (role === "Customer") mainTab = <CustomerOrderHistoryTab />;
  else if (role === "Shop Owner") mainTab = <ShopOwnerInventoryTab />;
=======
  const renderTableContent = () => {
    switch (role) {
      case "Customer":
        return <CustomerOrderHistory />;
      case "Shop Owner":
        return <ShopOwnerInventory />;
      default:
        return <WinemakerInventory />;
    }
  };
>>>>>>> origin/main

  return (
    <div className="flex flex-col gap-6 space-y-6 mt-6">
      <Tabs className="w-full" defaultValue="main">
        <TabsList className="w-full justify-start h-14 bg-secondary/40 rounded-2xl p-1 gap-2">
          <TabsTrigger
            className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            value="main"
          >
            {role === "Customer" ? (
<<<<<<< HEAD
              <ShoppingBag01Icon className="h-4 w-4 mr-2" />
            ) : (
              <DrinkIcon className="h-4 w-4 mr-2" />
=======
              <ShoppingBag className="h-4 w-4 mr-2" />
            ) : (
              <Wine className="h-4 w-4 mr-2" />
>>>>>>> origin/main
            )}
            {role === "Customer" ? "Order History" : "My Wines"}
          </TabsTrigger>
          {role !== "Customer" && (
            <TabsTrigger
              className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              value="bundles"
            >
              Bundles
            </TabsTrigger>
          )}
          <TabsTrigger
            className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            value="events"
          >
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="main">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
<<<<<<< HEAD
            <CardContent className="p-6 md:p-8">{mainTab}</CardContent>
=======
            <CardContent className="p-6 md:p-8">{renderTableContent()}</CardContent>
>>>>>>> origin/main
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="bundles">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent className="p-6 md:p-8">
<<<<<<< HEAD
              <BundlesListTab />
=======
              {/* Plug in the Bundles component here! */}
              <BundlesList />
>>>>>>> origin/main
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="events">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent className="p-6 md:p-8">
<<<<<<< HEAD
              <EventsListTab />
=======
              {/* Plug in the Events component here! */}
              <EventsList />
>>>>>>> origin/main
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
<<<<<<< HEAD
=======
// ==========================================
// 1. WINEMAKER VIEW
// ==========================================
function WinemakerInventory() {
  // Store data in an array so we can render it differently on Mobile vs Desktop
  const inventoryData = [
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      id: 1,
      name: "Chateau Montrose 2018",
      qty: 245,
      status: "In Stock",
      vintage: "2018",
    },
    {
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
      id: 2,
      name: "La Dame de Montrose 2019",
      qty: 8,
      status: "Low Stock",
      vintage: "2019",
    },
    {
      badgeClasses: "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFEBEE]",
      id: 3,
      name: "Tertio de Montrose 2020",
      qty: 0,
      status: "Out of Stock",
      vintage: "2020",
    },
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      id: 4,
      name: "Montrose Rose 2021",
      qty: 156,
      status: "In Stock",
      vintage: "2021",
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine className="h-5 w-5" /> My Wines
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[120px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="white">White</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Vintage
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Quantity
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
            {inventoryData.map((wine) => (
              <TableRow className="border-border/50 border-b" key={wine.id}>
                <TableCell className="font-medium text-sm">{wine.name}</TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">
                  {wine.vintage}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{wine.qty}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${wine.badgeClasses} border-none`}>{wine.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Hidden on Desktop) --- */}
      <div className="block md:hidden flex flex-col">
        {inventoryData.map((wine) => (
          <div
            className="flex justify-between py-5 border-b border-border/50 last:border-0"
            key={wine.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-[15px]">{wine.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {wine.vintage} <span className="mx-1">|</span> Qty: {wine.qty}
              </span>
              <div className="pt-1.5">
                <Badge className={`${wine.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {wine.status}
                </Badge>
              </div>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

// ==========================================
// 2. SHOP OWNER VIEW
// ==========================================
function ShopOwnerInventory() {
  const shopData = [
    {
      id: 1,
      name: "Chateau Montrose 2018",
      qty: 24,
      winemaker: "Chateau Montrose",
    },
    {
      id: 2,
      name: "La Dame de Montrose 2019",
      qty: 8,
      winemaker: "Chateau Montrose",
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine className="h-5 w-5" /> Shop Inventory
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[180px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Select Winemaker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Winemakers</SelectItem>
              <SelectItem value="montrose">Chateau Montrose</SelectItem>
              <SelectItem value="margaux">Chateau Margaux</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus className="h-4 w-4 mr-2" /> Add Wine
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead className="text-muted-foreground font-medium">Winemaker</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                In Shop
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shopData.map((wine) => (
              <TableRow className="border-border/50 border-b" key={wine.id}>
                <TableCell className="font-medium text-sm">{wine.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{wine.winemaker}</TableCell>
                <TableCell className="text-center font-medium text-sm">{wine.qty}</TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden flex flex-col">
        {shopData.map((wine) => (
          <div
            className="flex justify-between py-5 border-b border-border/50 last:border-0"
            key={wine.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-[15px]">{wine.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {wine.winemaker} <span className="mx-1">|</span> Qty: {wine.qty}
              </span>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

// ==========================================
// 3. CUSTOMER VIEW
// ==========================================
function CustomerOrderHistory() {
  const orderData = [
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      date: "April 12, 2026",
      id: 1,
      items: "3 Bottles",
      orderId: "#ORD-7392",
      status: "Delivered",
      total: "€425.00",
    },
    {
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
      date: "March 28, 2026",
      id: 2,
      items: "1 Bottle",
      orderId: "#ORD-7391",
      status: "Processing",
      total: "€150.00",
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <ShoppingBag className="h-5 w-5" /> Past Orders
        </div>
        <div className="flex w-full md:w-auto">
          <Select defaultValue="6months">
            <SelectTrigger className="w-full sm:w-[160px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Order ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Items</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderData.map((order) => (
              <TableRow className="border-border/50 border-b" key={order.id}>
                <TableCell className="font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer text-sm">
                  {order.orderId} <ArrowUpRight className="h-3 w-3" />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{order.date}</TableCell>
                <TableCell className="text-center font-medium text-sm">{order.items}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${order.badgeClasses} border-none`}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-sm">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden flex flex-col">
        {orderData.map((order) => (
          <div
            className="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
            key={order.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-[15px] text-primary flex items-center gap-1">
                {order.orderId} <ArrowUpRight className="h-3 w-3" />
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {order.date} <span className="mx-1">|</span> {order.items}
              </span>
              <div className="pt-1.5">
                <Badge className={`${order.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div className="font-medium text-[15px]">{order.total}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ==========================================
// 4. BUNDLES VIEW
// ==========================================
function BundlesList() {
  const bundlesData = [
    {
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
      id: 1,
      items: "3 Bottles",
      name: "Holiday Red Trio",
      price: "€120.00",
      status: "Active",
    },
    {
      badgeClasses: "bg-secondary text-secondary-foreground hover:bg-secondary",
      id: 2,
      items: "2 Bottles",
      name: "Summer White Duo",
      price: "€45.00",
      status: "Draft",
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Package className="h-5 w-5" /> Active Bundles
        </div>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <Plus className="h-4 w-4 mr-2" /> Create Bundle
        </Button>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground font-medium">Bundle Name</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Contents
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">Price</TableHead>
              <TableHead className="text-muted-foreground font-medium text-center">
                Status
              </TableHead>
              <TableHead className="text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundlesData.map((bundle) => (
              <TableRow className="border-border/50 border-b" key={bundle.id}>
                <TableCell className="font-medium text-sm">{bundle.name}</TableCell>
                <TableCell className="text-center text-muted-foreground text-sm">
                  {bundle.items}
                </TableCell>
                <TableCell className="text-center font-medium text-sm">{bundle.price}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${bundle.badgeClasses} border-none`}>{bundle.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="block md:hidden flex flex-col">
        {bundlesData.map((bundle) => (
          <div
            className="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
            key={bundle.id}
          >
            <div className="flex flex-col gap-1.5">
              <span className="font-heading font-semibold text-[15px]">{bundle.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {bundle.items} <span className="mx-1">|</span> {bundle.price}
              </span>
              <div className="pt-1.5">
                <Badge className={`${bundle.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {bundle.status}
                </Badge>
              </div>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

// ==========================================
// 5. EVENTS VIEW
// ==========================================
function EventsList() {
  const eventsData = [
    {
      attendees: "45 / 50",
      badgeClasses: "bg-[#E3F2FD] text-[#1976D2] hover:bg-[#E3F2FD]",
      date: "May 15, 2026",
      id: 1,
      location: "Paris, FR",
      name: "Spring Tasting 2026",
      status: "Upcoming",
    },
    {
      attendees: "12 / 20",
      badgeClasses: "bg-[#E3F2FD] text-[#1976D2] hover:bg-[#E3F2FD]",
      date: "June 02, 2026",
      id: 2,
      location: "Lyon, FR",
      name: "Winemaker Dinner",
      status: "Upcoming",
    },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar className="h-5 w-5" /> Hosted Events
        </div>
        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <Plus className="h-4 w-4 mr-2" /> Schedule Event
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
                  <Badge className={`${event.badgeClasses} border-none`}>{event.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button className="h-8 w-8 text-muted-foreground" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
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
              <span className="font-heading font-semibold text-[15px]">{event.name}</span>
              <span className="text-xs text-muted-foreground font-medium">
                {event.date} <span className="mx-1">|</span> {event.location}
              </span>
              <div className="pt-1.5 flex items-center gap-2">
                <Badge className={`${event.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {event.status}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium pl-2 border-l border-border/50">
                  {event.attendees}
                </span>
              </div>
            </div>
            <Button className="h-8 w-8 -mr-2 text-muted-foreground" size="icon" variant="ghost">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
>>>>>>> origin/main
