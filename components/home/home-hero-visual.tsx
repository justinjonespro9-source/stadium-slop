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
        className="object-contain object-[72%_58%] sm:object-[78%_52%] lg:object-[74%_48%]"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-[#060a10]/88 via-[#060a10]/35 to-transparent sm:from-[#060a10]/75 sm:via-[#060a10]/20" />
    </div>
  );
}
