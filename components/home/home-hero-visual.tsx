import Image from "next/image";

import { HOME_HERO_VISUAL } from "@/lib/media-assets";

type HomeHeroVisualProps = {
  className?: string;
};

export function HomeHeroVisual({ className = "" }: HomeHeroVisualProps) {
  return (
    <div
      className={["media-home-hero__visual relative h-full w-full", className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <Image
        src={HOME_HERO_VISUAL}
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 55vw, 42vw"
        className="object-contain object-[center_55%] sm:object-[75%_50%] lg:object-[70%_45%]"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#060a10]/75 sm:to-[#060a10]/55 lg:to-[#060a10]/40" />
    </div>
  );
}
