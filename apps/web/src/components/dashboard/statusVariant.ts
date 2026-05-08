export function statusVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "secondary" | "outline" {
  switch (status) {
    case "In Stock":
    case "Delivered":
    case "Active":
      return "success";
    case "Low Stock":
    case "Processing":
      return "warning";
    case "Out of Stock":
    case "Cancelled":
      return "danger";
    case "Upcoming":
      return "info";
    case "Draft":
      return "secondary";
    default:
      return "outline";
  }
}
