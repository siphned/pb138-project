import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-heading font-bold">Welcome to Wine Enjoyers</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            A premium marketplace for winemakers and wine lovers. Discover, buy, and enjoy the
            finest wines from across the region.
          </p>
        </div>
      </main>
    </div>
  );
}
