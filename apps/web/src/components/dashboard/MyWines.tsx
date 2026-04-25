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

interface MyWinesProps {
  role?: "Winemaker" | "Shop Owner" | "Customer" | string;
}

export function MyWines({ role = "Winemaker" }: MyWinesProps) {
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

  return (
    <div class="flex flex-col gap-6 space-y-6 mt-6">
      <Tabs defaultValue="main" class="w-full">
        <TabsList class="w-full justify-start h-14 bg-secondary/40 rounded-2xl p-1 gap-2">
          <TabsTrigger
            value="main"
            class="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {role === "Customer" ? (
              <ShoppingBag class="h-4 w-4 mr-2" />
            ) : (
              <Wine class="h-4 w-4 mr-2" />
            )}
            {role === "Customer" ? "Order History" : "My Wines"}
          </TabsTrigger>
          {role !== "Customer" && (
            <TabsTrigger
              value="bundles"
              class="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              Bundles
            </TabsTrigger>
          )}
          <TabsTrigger
            value="events"
            class="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="main" class="mt-6">
          <Card class="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent class="p-6 md:p-8">{renderTableContent()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundles" class="mt-6">
          <Card class="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent class="p-6 md:p-8">
              {/* Plug in the Bundles component here! */}
              <BundlesList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" class="mt-6">
          <Card class="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent class="p-6 md:p-8">
              {/* Plug in the Events component here! */}
              <EventsList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
// ==========================================
// 1. WINEMAKER VIEW
// ==========================================
function WinemakerInventory() {
  // Store data in an array so we can render it differently on Mobile vs Desktop
  const inventoryData = [
    {
      id: 1,
      name: "Chateau Montrose 2018",
      vintage: "2018",
      qty: 245,
      status: "In Stock",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
    },
    {
      id: 2,
      name: "La Dame de Montrose 2019",
      vintage: "2019",
      qty: 8,
      status: "Low Stock",
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
    },
    {
      id: 3,
      name: "Tertio de Montrose 2020",
      vintage: "2020",
      qty: 0,
      status: "Out of Stock",
      badgeClasses: "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFEBEE]",
    },
    {
      id: 4,
      name: "Montrose Rose 2021",
      vintage: "2021",
      qty: 156,
      status: "In Stock",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
    },
  ];

  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine class="h-5 w-5" /> My Wines
        </div>
        <div class="flex items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger class="w-full sm:w-[120px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="white">White</SelectItem>
            </SelectContent>
          </Select>
          <Button class="w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus class="h-4 w-4 mr-2" /> Add
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW (Hidden on Mobile) --- */}
      <div class="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Vintage</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Quantity</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Status</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((wine) => (
              <TableRow key={wine.id} class="border-border/50 border-b">
                <TableCell class="font-medium text-sm">{wine.name}</TableCell>
                <TableCell class="text-center text-muted-foreground text-sm">
                  {wine.vintage}
                </TableCell>
                <TableCell class="text-center font-medium text-sm">{wine.qty}</TableCell>
                <TableCell class="text-center">
                  <Badge class={`${wine.badgeClasses} border-none`}>{wine.status}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW (Hidden on Desktop) --- */}
      <div class="block md:hidden flex flex-col">
        {inventoryData.map((wine) => (
          <div
            key={wine.id}
            class="flex justify-between py-5 border-b border-border/50 last:border-0"
          >
            <div class="flex flex-col gap-1.5">
              <span class="font-heading font-semibold text-[15px]">{wine.name}</span>
              <span class="text-xs text-muted-foreground font-medium">
                {wine.vintage} <span class="mx-1">|</span> Qty: {wine.qty}
              </span>
              <div class="pt-1.5">
                <Badge class={`${wine.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {wine.status}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 -mr-2 text-muted-foreground">
              <MoreHorizontal class="h-5 w-5" />
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
      winemaker: "Chateau Montrose",
      qty: 24,
    },
    {
      id: 2,
      name: "La Dame de Montrose 2019",
      winemaker: "Chateau Montrose",
      qty: 8,
    },
  ];

  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Wine class="h-5 w-5" /> Shop Inventory
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Select defaultValue="all">
            <SelectTrigger class="w-full sm:w-[180px] bg-background border-none rounded-lg h-10">
              <SelectValue placeholder="Select Winemaker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Winemakers</SelectItem>
              <SelectItem value="montrose">Chateau Montrose</SelectItem>
              <SelectItem value="margaux">Chateau Margaux</SelectItem>
            </SelectContent>
          </Select>
          <Button class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
            <Plus class="h-4 w-4 mr-2" /> Add Wine
          </Button>
        </div>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div class="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Wine Name</TableHead>
              <TableHead class="text-muted-foreground font-medium">Winemaker</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">In Shop</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shopData.map((wine) => (
              <TableRow key={wine.id} class="border-border/50 border-b">
                <TableCell class="font-medium text-sm">{wine.name}</TableCell>
                <TableCell class="text-muted-foreground text-sm">{wine.winemaker}</TableCell>
                <TableCell class="text-center font-medium text-sm">{wine.qty}</TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div class="block md:hidden flex flex-col">
        {shopData.map((wine) => (
          <div
            key={wine.id}
            class="flex justify-between py-5 border-b border-border/50 last:border-0"
          >
            <div class="flex flex-col gap-1.5">
              <span class="font-heading font-semibold text-[15px]">{wine.name}</span>
              <span class="text-xs text-muted-foreground font-medium">
                {wine.winemaker} <span class="mx-1">|</span> Qty: {wine.qty}
              </span>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 -mr-2 text-muted-foreground">
              <MoreHorizontal class="h-5 w-5" />
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
      id: 1,
      orderId: "#ORD-7392",
      date: "April 12, 2026",
      items: "3 Bottles",
      total: "€425.00",
      status: "Delivered",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
    },
    {
      id: 2,
      orderId: "#ORD-7391",
      date: "March 28, 2026",
      items: "1 Bottle",
      total: "€150.00",
      status: "Processing",
      badgeClasses: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
    },
  ];

  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <ShoppingBag class="h-5 w-5" /> Past Orders
        </div>
        <div class="flex w-full md:w-auto">
          <Select defaultValue="6months">
            <SelectTrigger class="w-full sm:w-[160px] bg-background border-none rounded-lg h-10">
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
      <div class="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Order ID</TableHead>
              <TableHead class="text-muted-foreground font-medium">Date</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Items</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Status</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderData.map((order) => (
              <TableRow key={order.id} class="border-border/50 border-b">
                <TableCell class="font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer text-sm">
                  {order.orderId} <ArrowUpRight class="h-3 w-3" />
                </TableCell>
                <TableCell class="text-muted-foreground text-sm">{order.date}</TableCell>
                <TableCell class="text-center font-medium text-sm">{order.items}</TableCell>
                <TableCell class="text-center">
                  <Badge class={`${order.badgeClasses} border-none`}>{order.status}</Badge>
                </TableCell>
                <TableCell class="text-right font-medium text-sm">{order.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div class="block md:hidden flex flex-col">
        {orderData.map((order) => (
          <div
            key={order.id}
            class="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
          >
            <div class="flex flex-col gap-1.5">
              <span class="font-heading font-semibold text-[15px] text-primary flex items-center gap-1">
                {order.orderId} <ArrowUpRight class="h-3 w-3" />
              </span>
              <span class="text-xs text-muted-foreground font-medium">
                {order.date} <span class="mx-1">|</span> {order.items}
              </span>
              <div class="pt-1.5">
                <Badge class={`${order.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {order.status}
                </Badge>
              </div>
            </div>
            <div class="font-medium text-[15px]">{order.total}</div>
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
      id: 1,
      name: "Holiday Red Trio",
      items: "3 Bottles",
      price: "€120.00",
      status: "Active",
      badgeClasses: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
    },
    {
      id: 2,
      name: "Summer White Duo",
      items: "2 Bottles",
      price: "€45.00",
      status: "Draft",
      badgeClasses: "bg-secondary text-secondary-foreground hover:bg-secondary",
    },
  ];

  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Package class="h-5 w-5" /> Active Bundles
        </div>
        <Button class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <Plus class="h-4 w-4 mr-2" /> Create Bundle
        </Button>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div class="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Bundle Name</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Contents</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Price</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Status</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundlesData.map((bundle) => (
              <TableRow key={bundle.id} class="border-border/50 border-b">
                <TableCell class="font-medium text-sm">{bundle.name}</TableCell>
                <TableCell class="text-center text-muted-foreground text-sm">
                  {bundle.items}
                </TableCell>
                <TableCell class="text-center font-medium text-sm">{bundle.price}</TableCell>
                <TableCell class="text-center">
                  <Badge class={`${bundle.badgeClasses} border-none`}>{bundle.status}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div class="block md:hidden flex flex-col">
        {bundlesData.map((bundle) => (
          <div
            key={bundle.id}
            class="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
          >
            <div class="flex flex-col gap-1.5">
              <span class="font-heading font-semibold text-[15px]">{bundle.name}</span>
              <span class="text-xs text-muted-foreground font-medium">
                {bundle.items} <span class="mx-1">|</span> {bundle.price}
              </span>
              <div class="pt-1.5">
                <Badge class={`${bundle.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {bundle.status}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 -mr-2 text-muted-foreground">
              <MoreHorizontal class="h-5 w-5" />
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
      id: 1,
      name: "Spring Tasting 2026",
      date: "May 15, 2026",
      location: "Paris, FR",
      attendees: "45 / 50",
      status: "Upcoming",
      badgeClasses: "bg-[#E3F2FD] text-[#1976D2] hover:bg-[#E3F2FD]",
    },
    {
      id: 2,
      name: "Winemaker Dinner",
      date: "June 02, 2026",
      location: "Lyon, FR",
      attendees: "12 / 20",
      status: "Upcoming",
      badgeClasses: "bg-[#E3F2FD] text-[#1976D2] hover:bg-[#E3F2FD]",
    },
  ];

  return (
    <>
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-2 font-heading text-xl font-semibold text-primary">
          <Calendar class="h-5 w-5" /> Hosted Events
        </div>
        <Button class="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 px-5">
          <Plus class="h-4 w-4 mr-2" /> Schedule Event
        </Button>
      </div>

      {/* --- DESKTOP VIEW --- */}
      <div class="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow class="border-border/50 hover:bg-transparent">
              <TableHead class="text-muted-foreground font-medium">Event Name</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">
                Date & Location
              </TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Attendees</TableHead>
              <TableHead class="text-muted-foreground font-medium text-center">Status</TableHead>
              <TableHead class="text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsData.map((event) => (
              <TableRow key={event.id} class="border-border/50 border-b">
                <TableCell class="font-medium text-sm">{event.name}</TableCell>
                <TableCell class="text-center text-muted-foreground text-sm">
                  {event.date} • {event.location}
                </TableCell>
                <TableCell class="text-center font-medium text-sm">{event.attendees}</TableCell>
                <TableCell class="text-center">
                  <Badge class={`${event.badgeClasses} border-none`}>{event.status}</Badge>
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div class="block md:hidden flex flex-col">
        {eventsData.map((event) => (
          <div
            key={event.id}
            class="flex justify-between items-center py-5 border-b border-border/50 last:border-0"
          >
            <div class="flex flex-col gap-1.5">
              <span class="font-heading font-semibold text-[15px]">{event.name}</span>
              <span class="text-xs text-muted-foreground font-medium">
                {event.date} <span class="mx-1">|</span> {event.location}
              </span>
              <div class="pt-1.5 flex items-center gap-2">
                <Badge class={`${event.badgeClasses} border-none px-2 py-0.5 text-[10px]`}>
                  {event.status}
                </Badge>
                <span class="text-xs text-muted-foreground font-medium pl-2 border-l border-border/50">
                  {event.attendees}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8 -mr-2 text-muted-foreground">
              <MoreHorizontal class="h-5 w-5" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
