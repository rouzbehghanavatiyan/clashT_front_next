  import Image from "next/image";
  import Link from "next/link";
  import { SITE_LOGO, SITE_NAME } from "@/lib/seo";

  type BrandLogoProps = {
    showName?: boolean;
    size?: number;
    className?: string;
    nameClassName?: string;
    imageClassName?: string;
    href?: string;
  };

  export function BrandLogo({
    showName = true,
    size = 36,
    className = "",
    nameClassName = "whitespace-nowrap text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100",
    imageClassName = "",
    href = "/",
  }: BrandLogoProps) {
    return (
      <Link
        href={href}
        aria-label={SITE_NAME}
        className={`inline-flex items-center min-w-0 ${showName ? "gap-2" : ""} ${className}`}
      >
        <Image
          src={SITE_LOGO}
          alt={SITE_NAME}
          width={size}
          height={size}
          className={`shrink-0 rounded-full ${imageClassName}`}
          priority
        />
        {showName ? (
          <span className={nameClassName}>
            Clash<span className="text-blue-600">T</span>
            alent
          </span>
        ) : null}
      </Link>
    );
  }
