type HornIconProps = {
  className?: string;
};

export function HornIcon({ className }: HornIconProps) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Corne gauche */}
      <path
        d="M9.2 8
           C6.8 6.7 6.5 4.5 8 2.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Corne droite */}
      <path
        d="M14.8 8
           C17.2 6.7 17.5 4.5 16 2.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Oreille gauche */}
      <path
        d="M9.5 8.5
           L6.8 10.2
           L8.5 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Oreille droite */}
      <path
        d="M14.5 8.5
           L17.2 10.2
           L15.5 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tête */}
      <path
        d="M12 7
           L15.2 11
           L13.8 19
           H10.2
           L8.8 11
           Z"
        fill="currentColor"
      />
    </svg>
  );
}