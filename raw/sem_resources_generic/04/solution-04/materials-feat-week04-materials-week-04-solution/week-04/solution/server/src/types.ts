import { z } from "zod";

const CategorySchema = z.enum(["displays", "peripherals", "accessories", "uncategorised"])

export const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number().min(0),
    stock: z.number().min(0),
    category: CategorySchema
});

export type Product = z.infer<typeof ProductSchema>;


export const CreateProductBodySchema = z.object({
    name: z.string(),
    price: z.number().min(0),
    stock: z.number().optional(),
    category: CategorySchema.optional()
});

export type CreateProductBody = z.infer<typeof CreateProductBodySchema>;
