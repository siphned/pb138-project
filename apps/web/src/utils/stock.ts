export const getStockStatus = (qty: number) => {
  if (qty > 10) {
    return {
      label: "In Stock",
      classes: "bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9]",
    };
  }
  if (qty > 0) {
    return {
      label: "Low Stock",
      classes: "bg-[#FFF3E0] text-[#EF6C00] hover:bg-[#FFF3E0]",
    };
  }
  return {
    label: "Out of Stock",
    classes: "bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFEBEE]",
  };
};
