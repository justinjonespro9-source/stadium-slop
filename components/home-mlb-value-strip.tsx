/** Static MLB positioning line — no data fetch. */
export function HomeMlbValueStrip() {
  const lines = ["Game Day Fresh", "Real fan photos and reviews"];

  return (
    <ul className="mt-5 flex flex-col gap-2 border-l-2 border-[var(--slop-orange)] pl-4 text-sm font-bold text-[color:rgba(255,244,223,0.88)] sm:text-base">
      {lines.map((text) => (
        <li key={text}>{text}</li>
      ))}
    </ul>
  );
}
