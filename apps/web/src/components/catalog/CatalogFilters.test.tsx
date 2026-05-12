import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogFilters } from "./CatalogFilters";

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

  it("renders color checkboxes only for wines", () => {
    const { rerender } = render(
      <CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getAllByLabelText(/red/i).length).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/white/i).length).toBeGreaterThan(0);

    rerender(<CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />);
    expect(screen.queryByLabelText(/red/i)).not.toBeInTheDocument();
  });

  it("renders region select for wines and winemakers", () => {
    const { rerender } = render(
      <CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getAllByText(/region/i).length).toBeGreaterThan(0);

    rerender(
      <CatalogFilters entity="winemakers" onSearchChange={mockOnSearchChange} search={{}} />
    );
    expect(screen.getAllByText(/region/i).length).toBeGreaterThan(0);

    rerender(<CatalogFilters entity="products" onSearchChange={mockOnSearchChange} search={{}} />);
    expect(screen.queryByText(/region/i)).not.toBeInTheDocument();
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

  it("calls onSearchChange when q changes", () => {
    render(<CatalogFilters entity="wines" onSearchChange={mockOnSearchChange} search={{}} />);
    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.change(input, { target: { value: "riesling" } });
    expect(mockOnSearchChange).toHaveBeenCalledWith({ q: "riesling" });
  });
});
