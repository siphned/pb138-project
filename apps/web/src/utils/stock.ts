export const getStockStatus = (qty: number) => {
  if (qty > 10) {
    return {
      label: "In Stock",
      classes: "bg-green-100 text-green-800 hover:bg-green-100",
    };
  }
  if (qty > 0) {
    return {
      label: "Low Stock",
      classes: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    };
  }
  return {
    label: "Out of Stock",
    classes: "bg-red-100 text-red-800 hover:bg-red-100",
  };
};
