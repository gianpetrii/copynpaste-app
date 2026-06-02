interface ClipboardIconProps {
  className?: string;
  size?: number;
}

export function ClipboardIcon({ className = "", size = 24 }: ClipboardIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Back document */}
      <path
        d="M9 7h9a1.5 1.5 0 0 1 1.5 1.5v12A1.5 1.5 0 0 1 18 22H9a1.5 1.5 0 0 1-1.5-1.5v-12A1.5 1.5 0 0 1 9 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Front document body */}
      <path
        d="M4.5 3.5H12L16 7.5V19a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 19V5A1.5 1.5 0 0 1 4.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="hsl(var(--background))"
        strokeLinejoin="round"
      />
      {/* Dog-ear fold */}
      <path
        d="M12 3.5V7.5H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Short header line */}
      <line x1="6" y1="11" x2="9.5" y2="11" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      {/* Content lines */}
      <line x1="6" y1="13.5" x2="13" y2="13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="6" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <line x1="6" y1="18.5" x2="11" y2="18.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  );
}
