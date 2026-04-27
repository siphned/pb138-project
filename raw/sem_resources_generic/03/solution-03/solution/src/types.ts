export type Platform = "PC" | "Xbox" | "PlayStation" | "Nintendo Switch" | "Mobile";
export type Genre = "Action" | "Adventure" | "Puzzle" | "Simulation";

export type GameDetails = {
    releaseDate: string;
    platforms: Platform[];
}

export type Game = {
    title: string;
    genre: Genre;
    description: string;
    rating: number;
    details: GameDetails;
}

export type GameWithOnlinePlayers = Game & {
    onlineCount: number | undefined;
};