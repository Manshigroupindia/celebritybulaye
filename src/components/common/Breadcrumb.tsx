import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-gray-500 py-3 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-gray-500 hover:text-[#9B111E] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="inline-flex items-center gap-1 sm:gap-1.5">
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-[#9B111E] transition-colors text-gray-500 truncate max-w-[160px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
