"use client";

export function ArchitecturalGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2] px-8 md:px-16 lg:px-24"
    >
      {/* Vertical column lines */}
      <div className="relative mx-auto h-full w-full max-w-[1800px]">
        <div className="absolute inset-0 grid grid-cols-12">
          {Array.from({ length: 13 }).map((_, i) => (
            <div
              key={i}
              className="h-full"
              style={{
                position: "absolute",
                left: `${(i / 12) * 100}%`,
                width: "1px",
                background: `rgba(var(--grid-line))`,
              }}
            />
          ))}
        </div>

        {/* Corner coordinates */}
        <span
          className="absolute left-0 top-6 font-mono text-micro uppercase tracking-[0.22em]"
          style={{ color: "hsl(var(--accent-strong))" }}
        >
          23.55 S, 46.63 W
        </span>
      </div>
    </div>
  );
}
