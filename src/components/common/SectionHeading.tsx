import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  actionHref?: string;
  align?: "left" | "center";
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  badge,
  title,
  subtitle,
  actionText,
  actionHref,
  align = "left",
  className = "",
}) => {
  const isCentered = align === "center";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 ${
        isCentered ? "text-center items-center" : ""
      } ${className}`}
    >
      <div className={isCentered ? "max-w-2xl mx-auto" : "max-w-2xl"}>
        {badge && (
          <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
            <span className="h-0.5 w-4 bg-[#9B111E]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#9B111E]">
              {badge}
            </span>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight font-serif">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm sm:text-base text-gray-600 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <div className="shrink-0">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#9B111E] hover:text-[#740D16] group transition-colors"
          >
            <span>{actionText}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
