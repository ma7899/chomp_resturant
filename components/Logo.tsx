export default function Logo({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  if (variant === "mark") {
    return (
      <svg
        viewBox="0 0 64 64"
        className={className}
        aria-label="Chomp"
        role="img">
        <rect width="64" height="64" rx="14" fill="#f56a16" />
        <text
          x="50%"
          y="58%"
          textAnchor="middle"
          fontFamily="system-ui, sans-serif"
          fontWeight="900"
          fontSize="22"
          fill="white"
          letterSpacing="-1">
          CHOMP
        </text>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 220 80"
      className={className}
      aria-label="Chomp Sandwich"
      role="img">
      <text
        x="0"
        y="48"
        fontFamily="system-ui, sans-serif"
        fontWeight="900"
        fontSize="52"
        fill="#f56a16"
        letterSpacing="-2">
        CHOMP
      </text>
      <text
        x="4"
        y="70"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
        fontSize="16"
        fill="#f56a16"
        letterSpacing="2">
        Sandwich
      </text>
    </svg>
  );
}
