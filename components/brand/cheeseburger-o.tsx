/** Cheeseburger “O” for the Stadium Slop wordmark */
export function CheeseburgerO({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="11" fill="#ff6b1a" stroke="#ff8533" strokeWidth="1.5" />
      <path
        d="M5.5 9.5h13a2 2 0 0 0 0-4H5.5a2 2 0 0 0 0 4Z"
        fill="#f4c56a"
        stroke="#d4923a"
        strokeWidth="0.75"
      />
      <ellipse cx="12" cy="10.5" rx="5.5" ry="2.2" fill="#6d3b1f" />
      <path
        d="M6.5 11.5h11c1.5 0 2.5 1.2 2.5 2.5s-1 2.5-2.5 2.5H8.5c-1.5 0-2.5-1.2-2.5-2.5s1-2.5 2.5-2.5Z"
        fill="#c63d2f"
      />
      <ellipse cx="12" cy="12.5" rx="4.5" ry="1.2" fill="#f4d03f" opacity="0.85" />
      <rect x="8" y="8.2" width="3" height="1.2" rx="0.4" fill="#3d8f4a" />
      <rect x="13.5" y="8.5" width="2.5" height="1" rx="0.35" fill="#c63d2f" />
      <path
        d="M5.5 15h13a1.5 1.5 0 0 0 0-3H5.5a1.5 1.5 0 0 0 0 3Z"
        fill="#f4c56a"
        stroke="#d4923a"
        strokeWidth="0.75"
      />
    </svg>
  );
}
