import { Game } from "./types";

export default [
    {
        title: "Ninja Kittens Strike Back",
        genre: "Action",
        description: "Join our fluffy feline heroes as they battle evil robotic vacuum cleaners with their deadly cuteness!",
        rating: 4.5,
        details: {
            releaseDate: "2023-10-31",
            platforms: ["PC", "Nintendo Switch"]
        }
    },
    {
        title: "Zombie Unicorn Apocalypse",
        genre: "Adventure",
        description: "Embark on a quest to save the enchanted forest from a horde of undead unicorns craving glitter and brains!",
        rating: 4.2,
        details: {
            releaseDate: "2023-10-31",
            platforms: ["PC", "Nintendo Switch"]
        }
    },
    {
        title: "Pancake Flipper Pro",
        genre: "Simulation",
        description: "Experience the thrill of competitive pancake flipping! Master the art of spatula-fu and become the ultimate flapjack champion!",
        rating: 4.7,
        details: {
            releaseDate: "2023-09-25",
            platforms: ["PC", "Mobile"]
        }
    }
] satisfies Game[];
