import Image from "next/image";

import { HOME_HERO_VISUAL } from "@/lib/media-assets";

type HomeHeroVisualProps = {
  className?: string;
};

export function HomeHeroVisual({ className = "" }: HomeHeroVisualProps) {
  return (
    <div
      className={[
        "relative w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.45)] sm:rounded-3xl",
        "aspect-[16/10] sm:aspect-[16/11] lg:aspect-auto lg:min-h-[min(28rem,72vh)] lg:rounded-[1.75rem]",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <Image
        src={HOME_HERO_VISUAL}
        alt=""
        fill
        priority
        sizes="(max-width: 1023px) 100vw, 42vw"
        className="object-cover object-[65%_center] lg:object-[center_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060a10]/90 via-[#060a10]/25 to-transparent lg:bg-gradient-to-l lg:from-[#080d14]/95 lg:via-[#080d14]/35 lg:to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_40%,rgba(255,107,26,0.12),transparent_65%)]" />
    </div>
  );
}
