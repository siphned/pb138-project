import games from "./data"
import { Database, GamesWithLastPlayed, GamesOnlinePlayers } from "./lib/database";
import { filterGamesByGenre, sortGamesByReleaseDate, calculateAverageRating, readGamesFromDatabase, queryOnlineGamers } from "./repository";
import { Game, GameWithOnlinePlayers } from "./types";

const genre = "Adventure";
const genreGames = filterGamesByGenre(games, genre);

console.log(`Ahoy, adventurers! Behold the treasure trove of ${genre} games:`);

for (let game of genreGames) {
    const { title, description, rating } = game;
    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);
    console.log(`Rating: ${rating}`);
    console.log("--------------------");
}

// Prepare to be enchanted by a magical average rating revelation!
const averageRating = calculateAverageRating(games);
console.log(`The average rating of all games is: ${averageRating}`);

// Join the merry band of functions and spread joy with sorted games by release date!
const sortedGames = sortGamesByReleaseDate(games);
console.log("Sorted Games by Release Date:");
console.log(sortedGames);


const initGameLauncherAsync = async () => {
    const database = new Database<Game>(games);
    database.init();

    const gamesFromDatabase = await new Promise<GamesWithLastPlayed<Game>[]>((resolve, reject) => {
        return readGamesFromDatabase(database, (data, error) => {
            if (error) {
                reject(error);
            }
    
            resolve(data);
        });
    });

    const sortedGames = gamesFromDatabase.sort((a, b) => a.lastPlayed.getTime() - b.lastPlayed.getTime())

    const onlineGamersInGames = await new Promise<GamesOnlinePlayers[]>((resolve, reject) => {
        return queryOnlineGamers( database, (data, error) => {
            if (error) {
                reject(error);
            }
    
            resolve(data);
        });
    });
    
    const gamesWithOnlinePlayers : GameWithOnlinePlayers[] = sortedGames.map((game) => ({
        ...game,
        onlineCount: onlineGamersInGames.find(g => g.title === game.title)?.onlineGamers
    }))

    console.log(gamesWithOnlinePlayers)
}

initGameLauncherAsync()
