// Card strip used on entity detail pages (wine/product) for related-card
// sections. Always a horizontal flex row with fixed-width cards that overflows
// (scrolls) horizontally instead of wrapping into a grid; the scrollbar is
// hidden across browsers.
export const DETAIL_CARD_GRID =
  "flex gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export const DETAIL_CARD_ITEM = "w-44 shrink-0 sm:w-56";
