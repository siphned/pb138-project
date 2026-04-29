import type { ReactNode } from "react";

interface ProductHeroProps {
  children: {
    image: ReactNode;
    info: ReactNode;
  };
}

export function ProductHero({ children }: ProductHeroProps) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="w-full">{children.image}</div>
      <div className="w-full">{children.info}</div>
    </div>
  );
}
