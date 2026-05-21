"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import cn from "@utils/cn";

const links = [
  { href: "/blog", label: "blog" },
  { href: "/photos", label: "photos" },
  { href: "/tools", label: "tools" },
  { href: "/reviews", label: "reviews" },
  { href: "/contact", label: "contact" },
];

interface Props {
  variant?: "muted" | "accent";
  className?: string;
}

const NavLinks = ({ variant = "muted", className }: Props) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-display",
        className,
      )}
    >
      {links.map((link, i) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        const linkClass =
          variant === "accent"
            ? "text-accent hover:opacity-75"
            : isActive
              ? "text-accent font-medium hover:opacity-75"
              : "text-muted hover:text-accent";

        return (
          <span key={link.href} className="flex items-center gap-x-2">
            <Link
              href={link.href}
              className={cn("no-underline transition-colors", linkClass)}
            >
              {link.label}
            </Link>
            {i < links.length - 1 && (
              <span className="select-none text-subtle">·</span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default NavLinks;
