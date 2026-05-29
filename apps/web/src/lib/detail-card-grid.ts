// Card grid used on entity detail pages (wine/product) for related-card
// sections. Mobile: horizontal flex with fixed-width cards + scroll, keeping
// cards at desktop-ish size instead of collapsing. md+: standard 3/4-col grid.
export const DETAIL_CARD_GRID =
  "flex gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-4";

export const DETAIL_CARD_ITEM = "w-44 shrink-0 md:w-auto";
