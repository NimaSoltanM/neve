export function Logo({ className = 'h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 110 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Snowflake icon */}
      <g className="fill-primary">
        {/* Center */}
        <circle cx="16" cy="16" r="2" />

        {/* Six branches */}
        <rect x="15" y="4" width="2" height="24" rx="1" />
        <rect
          x="15"
          y="4"
          width="2"
          height="24"
          rx="1"
          transform="rotate(60 16 16)"
        />
        <rect
          x="15"
          y="4"
          width="2"
          height="24"
          rx="1"
          transform="rotate(-60 16 16)"
        />

        {/* Decorative crystals on branches */}
        <circle cx="16" cy="8" r="1.5" />
        <circle cx="16" cy="24" r="1.5" />
        <circle cx="22.4" cy="12" r="1.5" />
        <circle cx="9.6" cy="12" r="1.5" />
        <circle cx="22.4" cy="20" r="1.5" />
        <circle cx="9.6" cy="20" r="1.5" />
      </g>

      {/* NÉVÉ text - moved closer */}
      <g className="fill-foreground">
        <path d="M36 11h2.5l5.5 8v-8h2.5v10h-2.5l-5.5-8v8H36V11z" />
        <path d="M50 11h7v2h-4.5v2H56v2h-3.5v2H57v2h-7V11z M52.3 7h2l1.7 2.5h-1.8l-1-1.5l-1 1.5h-1.8L52.3 7z" />{' '}
        {/* É with accent */}
        <path d="M60 11h2.5l2 6 2-6H69l-3.5 10h-2L60 11z" />
        <path d="M72 11h7v2h-4.5v2H78v2h-3.5v2H79v2h-7V11z M74.3 7h2l1.7 2.5h-1.8l-1-1.5l-1 1.5h-1.8L74.3 7z" />{' '}
        {/* É with accent */}
      </g>
    </svg>
  )
}
