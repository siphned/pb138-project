/**
 * Do not edit this code
 */
export type GamesWithLastPlayed<T> = T & { lastPlayed: Date }
export type GamesOnlinePlayers = { title: string, onlineGamers: number }

export type DatabaseCallback<R> = (result: R[], error?: string) => void

const randomGamersOnline = (max: number) => Math.floor(Math.random() * max);

/**
 * Database simulation class
 * if you are brave enough you can try rewriting this logic with async await and still
 * simulating Web APIs without callbacks
 */
export class Database<T> {
    private isConnected = false;

    constructor(private readonly data: T[]) {}

    init() {
        this.isConnected = true;
    }

    query<R>(query: string, callback: DatabaseCallback<R>) {
        return setTimeout(() => {
            if (!this.isConnected) {
                throw new Error("Invalid query provided");
            }
            
            const q = query.toLowerCase();

            if (q === "select * from games;") {                
                return callback(
                    this.data.map(
                        t => ({...t, lastPlayed: new Date(new Date().valueOf() - Math.random()*(1e+12))})
                    ) as R[]
                );
            } else if (q.includes(`select * from gamers where status = "1";`)) {
                return callback(
                    this.data.map(
                        (t: any) => ({ title: t.title, onlineGamers: randomGamersOnline(1400) })
                    ) as R[]
                );
            } else {
                return callback([], "Error: Wrong query");
            }
        }, 500)
    }
}
