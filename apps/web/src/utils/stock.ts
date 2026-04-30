export const getStockStatus = (qty: number) => {
  if (qty > 10) {
    return {
      classes: "bg-green-100 text-green-800 hover:bg-green-100",
      label: "In Stock",
    };
  }
  if (qty > 0) {
    return {
      classes: "bg-orange-100 text-orange-800 hover:bg-orange-100",
      label: "Low Stock",
    };
  }
  return {
    classes: "bg-red-100 text-red-800 hover:bg-red-100",
    label: "Out of Stock",
  };
};
