import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { listProductsQueryKey, useCreateProduct, useDeleteProduct, useListProducts } from "./gen";

// Component
export default function ProductPage() {
    const queryClient = useQueryClient();

    const { data: products, isLoading, isError, error } = useListProducts();

    const createMutation = useCreateProduct({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: listProductsQueryKey() })
                // reset form
                setName("");
                setPrice("");
                setStock("");
                setCategory("");
            }
        }
    })

    const deleteMutation = useDeleteProduct({
        mutation: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: listProductsQueryKey() })
            }
        }
    })

    // Form
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !price) return;

        createMutation.mutate({
            data: {
                name: name.trim(),
                price: parseFloat(price),
                stock: stock ? parseInt(stock) : undefined,
                category: category.trim() || undefined,
            }
        });
    };

    return (
        <div>
            <h2>Add a Product</h2>
            <form onSubmit={handleSubmit}>
                <div className="field">
                    <label htmlFor="name">Name *</label>
                    <input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Wireless Mouse"
                        required
                    />
                </div>
                <div className="field">
                    <label htmlFor="price">Price *</label>
                    <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="29.99"
                        required
                    />
                </div>
                <div className="field">
                    <label htmlFor="stock">Stock</label>
                    <input
                        id="stock"
                        type="number"
                        min="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        placeholder="0"
                    />
                </div>
                <div className="field">
                    <label htmlFor="category">Category</label>
                    <input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="peripherals"
                    />
                </div>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? "Creating…" : "Add Product"}
                </button>
            </form>

            {createMutation.isError && (
                <p className="error">⚠ {createMutation.error.message}</p>
            )}

            <h2>Products</h2>

            {isLoading && <p className="loading">Loading products…</p>}
            {isError && <p className="error">⚠ {error.message}</p>}

            {products?.map((p) => (
                <div key={p.id} className="card">
                    <div className="card-info">
                        <strong>{p.name}</strong>
                        <span>
                            <span className="badge">{p.category}</span>{" "}
                            {p.stock > 0 ? (
                                <span className="stock">{p.stock} in stock</span>
                            ) : (
                                <span className="out-of-stock">Out of stock</span>
                            )}
                        </span>
                    </div>
                    <div className="card-right">
                        <span className="price">€{p.price.toFixed(2)}</span>
                        <button
                            className="btn-danger"
                            onClick={() => deleteMutation.mutate({id: p.id})}
                            disabled={deleteMutation.isPending}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            {products?.length === 0 && <p>No products yet. Add one above!</p>}
        </div>
    );
}
