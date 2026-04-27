import { DatabaseCallback, Database, GamesWithLastPlayed, GamesOnlinePlayers } from "./lib/database";
import { Game, Genre } from "./types";

export const filterGamesByGenre = (games: Game[], genre: Genre): Game[] => games.filter(game => game.genre === genre);

export const calculateAverageRating = (games: Game[]): number => {
    const totalRatings = games.reduce((acc, game) => acc + game.rating, 0);
    /* Notice usage of falsy value hack to prevent division by zero */
    return totalRatings / (games.length || 1);
};

export const sortGamesByReleaseDate = (games: Game[]): Game[] => {
    return games.sort((a, b) => new Date(a.details.releaseDate).getTime() - new Date(b.details.releaseDate).getTime());
};


/**
 * Helper functions to simulate Repository Pattern
 */
export function readGamesFromDatabase(database: Database<Game>, callback: DatabaseCallback<GamesWithLastPlayed<Game>>) {
    return database.query<GamesWithLastPlayed<Game>>("select * from games;", callback);
}

export function queryOnlineGamers(database: Database<Game>, callback: DatabaseCallback<GamesOnlinePlayers>) {
    return database.query<GamesOnlinePlayers>(`select * from gamers where status = "1";`, callback);
}
