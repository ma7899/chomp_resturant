import Image from "next/image";

/**
 * Chomp Sandwich brand logo.
 *
 * Drop the raster artwork at `public/images/logo.png` (recommended 512×512,
 * orange background per brand kit). Both variants render the same asset.
 */
export default function Logo({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  const isMark = variant === "mark";
  return (
    <span
      className={`inline-flex items-center ${className}`}
      aria-label="Chomp Sandwich">
      <Image
        src="/images/logo.png"
        alt="Chomp Sandwich"
        width={256}
        height={256}
        priority
        sizes="(max-width: 768px) 64px, 96px"
        className={`h-full w-auto object-contain ${isMark ? "rounded-xl" : "rounded-lg"}`}
      />
    </span>
  );
}
