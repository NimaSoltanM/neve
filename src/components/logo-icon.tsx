export function LogoIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g className="fill-primary">
        {/* Simplified snowflake */}
        <circle cx="16" cy="16" r="2.5" />

        {/* Main branches */}
        <rect x="14.5" y="3" width="3" height="26" rx="1.5" />
        <rect
          x="14.5"
          y="3"
          width="3"
          height="26"
          rx="1.5"
          transform="rotate(60 16 16)"
        />
        <rect
          x="14.5"
          y="3"
          width="3"
          height="26"
          rx="1.5"
          transform="rotate(-60 16 16)"
        />

        {/* Branch tips - crystals */}
        <circle cx="16" cy="6" r="2" />
        <circle cx="16" cy="26" r="2" />
        <circle cx="24.7" cy="11" r="2" />
        <circle cx="7.3" cy="11" r="2" />
        <circle cx="24.7" cy="21" r="2" />
        <circle cx="7.3" cy="21" r="2" />

        {/* Mid-branch details */}
        <circle cx="16" cy="10" r="1" />
        <circle cx="16" cy="22" r="1" />
        <circle cx="20.5" cy="13.5" r="1" />
        <circle cx="11.5" cy="13.5" r="1" />
        <circle cx="20.5" cy="18.5" r="1" />
        <circle cx="11.5" cy="18.5" r="1" />
      </g>
    </svg>
  )
}
