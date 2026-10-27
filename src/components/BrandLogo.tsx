import Image from "next/image";
import Link from "next/link";
import { SITE_LOGO, SITE_NAME } from "@/lib/seo";

type BrandLogoProps = {
  showName?: boolean;
  size?: number;
  className?: string;
  nameClassName?: string;
  href?: string;
};

export function BrandLogo({
  showName = true,
  size = 36,
  className = "",
  nameClassName = "whitespace-nowrap text-xl font-bold tracking-tight text-gray-900",
  href = "/",
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      aria-label={SITE_NAME}
      className={`inline-flex items-center gap-2 min-w-0 ${className}`}
    >
      <Image
        src={SITE_LOGO}
        alt={SITE_NAME}
        width={size}
        height={size}
        className="shrink-0 rounded-full"
        priority
      />
      {showName && (
        <span className={nameClassName}>
          Clash<span className="text-blue-600">Talent</span>
        </span>
      )}
    </Link>
  );
}
