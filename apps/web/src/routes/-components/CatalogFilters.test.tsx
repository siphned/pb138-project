import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogFilters } from "@/routes/-components/CatalogFilters";

describe("CatalogFilters", () => {
  const mockOnSearchChange = vi.fn();

  it("renders search input for all entities", () => {
    const { rerender } = render(
      <CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

    rerender(<CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();

    rerender(
      <CatalogFilters entity="winemakers" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("renders color filter only for wines and products", () => {
    const { rerender } = render(
      <CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getByText("Color")).toBeInTheDocument();

    rerender(<CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />);
    expect(screen.getByText("Color")).toBeInTheDocument();

    rerender(
      <CatalogFilters entity="winemakers" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.queryByText("Color")).not.toBeInTheDocument();
  });

  it("renders region filter only for wines and products", () => {
    const { rerender } = render(
      <CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getByText("Region")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/filter by region/i)).toBeInTheDocument();

    rerender(<CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />);
    expect(screen.getByText("Region")).toBeInTheDocument();

    rerender(
      <CatalogFilters entity="winemakers" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.queryByText("Region")).not.toBeInTheDocument();
  });

  it("renders price slider and bundle checkbox only for products", () => {
    const { rerender } = render(
      <CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getByText(/price range/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/bundles only/i).length).toBeGreaterThan(0);

    rerender(<CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />);
    expect(screen.queryByText(/price range/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/bundles only/i)).not.toBeInTheDocument();
  });

  it("calls onSearchChange when search changes for products (debounced)", async () => {
    render(<CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "riesling" } });

    await waitFor(
      () => {
        expect(mockOnSearchChange).toHaveBeenCalledWith(expect.objectContaining({ q: "riesling" }));
      },
      { timeout: 1000 }
    );
  });

  it("calls onSearchChange when q changes for non-products (debounced)", async () => {
    render(<CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "riesling" } });

    await waitFor(
      () => {
        expect(mockOnSearchChange).toHaveBeenCalledWith(expect.objectContaining({ q: "riesling" }));
      },
      { timeout: 1000 }
    );
  });
});
