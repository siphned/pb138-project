import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Movie = {
  id: number;
  title: string;
  watched: boolean;
};

type Filter = "all" | "to-watch" | "watched";

function loadMovies(): Movie[] {
  const stored = localStorage.getItem("movies");
  return stored ? JSON.parse(stored) : [];
}

export function MovieWatchlist() {
  const [movies, setMovies] = useState<Movie[]>(loadMovies);
  const [newTitle, setNewTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    localStorage.setItem("movies", JSON.stringify(movies));
  }, [movies]);

  const addMovie = () => {
    const title = newTitle.trim();
    if (!title) return;
    setMovies((prev) => [
      ...prev,
      { id: Date.now(), title, watched: false },
    ]);
    setNewTitle("");
  };

  const toggleWatched = (id: number) => {
    setMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, watched: !m.watched } : m)),
    );
  };

  const removeMovie = (id: number) => {
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const filteredMovies = movies.filter((m) => {
    if (filter === "to-watch") return !m.watched;
    if (filter === "watched") return m.watched;
    return true;
  });

  const unwatchedCount = movies.filter((m) => !m.watched).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-3xl font-bold">Movie Watchlist</h2>
        {unwatchedCount > 0 && (
          <Badge variant="secondary">{unwatchedCount} to watch</Badge>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a movie..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMovie()}
          className="max-w-sm"
        />
        <Button onClick={addMovie}>Add</Button>
      </div>

      <Separator className="my-6" />

      <div className="flex gap-2 mb-6">
        {(["all", "to-watch", "watched"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "to-watch" ? "To Watch" : "Watched"}
          </Button>
        ))}
      </div>

      {filteredMovies.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          {movies.length === 0
            ? "No movies yet. Add one above!"
            : "No movies match this filter."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovies.map((movie) => (
            <Card key={movie.id} className="gap-3 py-4">
              <CardHeader>
                <CardTitle className="text-lg">{movie.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={movie.watched ? "secondary" : "default"}>
                  {movie.watched ? "Watched \u2713" : "To Watch"}
                </Badge>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWatched(movie.id)}
                >
                  {movie.watched ? "Unwatch" : "Mark Watched"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMovie(movie.id)}
                >
                  Remove
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
