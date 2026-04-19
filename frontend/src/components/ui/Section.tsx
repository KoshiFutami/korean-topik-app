import React from "react";

export function Section({
  title,
  subtitle,
  description,
  right,
  children,
  className = "",
  headerClassName = "",
  titleClassName = "",
  descriptionClassName = "",
}: {
  title: string;
  subtitle?: string;
  description?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div className={`flex items-end justify-between gap-4 ${headerClassName}`}>
        <div>
          <h2 className={`text-lg font-semibold ${titleClassName || "text-zinc-900"}`}>
            {title}
            {subtitle ? (
              <span className="ml-2 align-baseline text-sm font-semibold opacity-80">
                {subtitle}
              </span>
            ) : null}
          </h2>
          {description ? (
            <p className={`mt-1 text-sm ${descriptionClassName || "text-zinc-600"}`}>{description}</p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {children}
    </section>
  );
}

