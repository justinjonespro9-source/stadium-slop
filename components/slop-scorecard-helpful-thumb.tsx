/** Thumbs-up glyph for front scorecard helpful control (outline vs filled). */
export function SlopScorecardHelpfulThumb({
  filled = false
}: {
  filled?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      aria-hidden
      className="block"
    >
      {filled ? (
        <path
          fill="currentColor"
          d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth={1.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 9V5a3 3 0 0 0-5.2-2.2L5 12v9h12.5a2 2 0 0 0 1.9-1.4l1.6-6.2a2 2 0 0 0-2-2.4H14zM7 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
        />
      )}
    </svg>
  );
}
