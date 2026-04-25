import express from "express";
import cors from "cors";
import { Product,  CreateProductBodySchema } from "./types";

const products: Product[] = [
    {
        id: 1,
        name: "Wireless Mouse",
        price: 29.99,
        stock: 150,
        category: "peripherals",
    },
    {
        id: 2,
        name: 'Monitor 27"',
        price: 349.0,
        stock: 42,
        category: "displays",
    },
    {
        id: 3,
        name: "Mechanical Keyboard",
        price: 89.95,
        stock: 85,
        category: "peripherals",
    },
    {
        id: 4,
        name: "USB-C Hub",
        price: 54.5,
        stock: 200,
        category: "accessories",
    },
    {
        id: 5,
        name: "Webcam HD",
        price: 74.99,
        stock: 0,
        category: "peripherals",
    },
];

let nextId = 6;


const app = express();
app.use(cors());
app.use(express.json());


// GET /products
// Returns all products
app.get("/products", (_req, res) => {
    res.json(products);
});


// GET /products/:id
// Returns a single product by its ID.
app.get("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const product = products.find((p) => p.id === id);

    if (!product) {
        res.status(404).json({
        status: 404,
        message: "Product not found",
    });
        return;
    }

    res.json(product);
});


// POST /products
// Creates a new product. Requires at least `name` and `price` in the body.
app.post("/products", (req, res) => {
    const parseResult = CreateProductBodySchema.safeParse(req.body);

    if (!parseResult.success) {
        res.status(400).json({ status: 400, message: parseResult.error.message })
        return;
    } else {
        const { name, price, stock, category } = parseResult.data;

        const newProduct: Product = {
            id: nextId++,
            name: name.trim(),
            price,
            stock: stock ?? 0,
            category: category ?? "uncategorised",
        };

        products.push(newProduct);
        res.status(201).json(parseResult.data);
    }
});


// DELETE /products/:id
// Deletes a product by ID.
app.delete("/products/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
        res.status(404).json({
            status: 404,
            message: "Product not found",
        });
        return;
    }

    products.splice(index, 1);
    res.status(204).send();
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✔ Server running on http://localhost:${PORT}`);
});
