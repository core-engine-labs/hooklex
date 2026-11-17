"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
];

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main
        ref={ref}
        onMouseMove={onMove}
        style={
          {
            "--mx": "0px",
            "--my": "0px",
          } as React.CSSProperties
        }
        className="
          relative isolate flex flex-1 items-center justify-center overflow-hidden
          bg-background text-foreground
          px-4 py-16 sm:py-24
        "
      >
        <style>{`
          /* ================================================
             ENTRANCE
          ================================================ */

          @keyframes rise {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          /* ================================================
             ORBS
          ================================================ */

          @keyframes driftA {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50%      { transform: translate3d(40px, -30px, 0) scale(1.08); }
          }

          @keyframes driftB {
            0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
            50%      { transform: translate3d(-35px, 25px, 0) scale(1.06); }
          }

          /* ================================================
             GRADIENT TEXT
          ================================================ */

          @keyframes sheen {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          /* ================================================
             STATUS DOT
          ================================================ */

          @keyframes pulseDot {
            0%, 100% { opacity: .45; transform: scale(.85); }
            50%      { opacity: 1;   transform: scale(1.2); }
          }

          /* ================================================
             FLOATING PARTICLES
          ================================================ */

          @keyframes floatParticle {
            0%, 100% { transform: translateY(0);    opacity: .2; }
            50%      { transform: translateY(-12px); opacity: .7; }
          }

          /* ================================================
             BUTTON SHINE
          ================================================ */

          @keyframes buttonShine {
            0%       { transform: translateX(-150%) rotate(15deg); }
            60%,100% { transform: translateX(250%)  rotate(15deg); }
          }

          /* ================================================
             CLASSES
          ================================================ */

          .hero-rise {
            opacity: 0;
            animation: rise .65s cubic-bezier(.2,.8,.2,1) forwards;
          }

          .drift-a { animation: driftA 18s ease-in-out infinite; }
          .drift-b { animation: driftB 22s ease-in-out infinite; }

          .sheen {
            background-size: 220% 220%;
            animation: sheen 7s ease-in-out infinite;
          }

          .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
          .particle  { animation: floatParticle 5s ease-in-out infinite; }

          .button-shine {
            animation: buttonShine 5s ease-in-out infinite;
          }

          /* ================================================
             REDUCED MOTION
          ================================================ */

          @media (prefers-reduced-motion: reduce) {
            .hero-rise { opacity: 1; animation: none; }

            .drift-a,
            .drift-b,
            .sheen,
            .pulse-dot,
            .particle,
            .button-shine { animation: none; }
          }
        `}</style>

        {/* ==================================================
            BACKGROUND
        ================================================== */}

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-260px] -translate-x-1/2">
            <div
              className="
                drift-a h-[650px] w-[650px] rounded-full

                bg-purple-700/[0.14] blur-[150px]
                dark:bg-purple-700/[0.20]
              "
            />
          </div>

          <div className="absolute -left-48 top-40">
            <div
              className="
                drift-b h-[430px] w-[430px] rounded-full

                bg-purple-700/[0.08] blur-[130px]
                dark:bg-purple-700/0.12
              "
            />
          </div>

          <div
            className="
              absolute -right-56 top-64 h-[420px] w-[420px] rounded-full

              bg-purple-700/[0.04] blur-[130px]
              dark:bg-purple-700/[0.07]
            "
          />

          <div
            aria-hidden
            className="
              absolute inset-0

              bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)]
              bg-[size:72px_72px]

              opacity-30

              [mask-image:radial-gradient(ellipse_70%_58%_at_50%_40%,black_15%,transparent_75%)]
            "
          />

          <div
            aria-hidden
            className="
              absolute inset-0

              [background:radial-gradient(520px_circle_at_var(--mx)_var(--my),rgb(126_34_206_/_0.18),transparent_72%)]
            "
          />

          <div
            aria-hidden
            className="
              absolute inset-0

              [background:radial-gradient(180px_circle_at_var(--mx)_var(--my),rgb(126_34_206_/_0.06),transparent_70%)]

              dark:[background:radial-gradient(180px_circle_at_var(--mx)_var(--my),rgb(126_34_206_/_0.10),transparent_70%)]
            "
          />

          <span className="particle absolute left-[16%] top-[26%] h-1 w-1 rounded-full bg-purple-700/90" />
          <span
            className="particle absolute left-[78%] top-[23%] h-1.5 w-1.5 rounded-full bg-purple-700/90"
            style={{ animationDelay: "1.5s" }}
          />
          <span
            className="particle absolute left-[84%] top-[57%] h-1 w-1 rounded-full bg-purple-700/90"
            style={{ animationDelay: "2.3s" }}
          />
          <span
            className="particle absolute left-[12%] top-[65%] h-1.5 w-1.5 rounded-full bg-purple-700/90"
            style={{ animationDelay: "3s" }}
          />
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          {/* Badge */}
          <div className="hero-rise" style={{ animationDelay: "0.05s" }}>
            <div
              className="
                group inline-flex items-center gap-2

                rounded-full border border-border

                bg-background/70

                px-3.5 py-1.5

                text-xs font-medium text-muted-foreground

                shadow-sm backdrop-blur-md

                transition-all duration-300

                hover:border-purple-700/60
                hover:bg-accent
                hover:text-accent-foreground
              "
            >
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inset-0 rounded-full bg-destructive" />
                <span className="relative h-2 w-2 rounded-full bg-destructive" />
              </span>
              Something went wrong
            </div>
          </div>

          {/* Big status code with sheen */}
          <h1
            className="
              hero-rise mt-8

              select-none
              text-[110px] font-extrabold leading-[0.85] tracking-[-0.06em]
              sm:text-[150px]
              md:text-[180px]
            "
            style={{ animationDelay: "0.15s" }}
          >
            <span
              className="
                sheen

                bg-[linear-gradient(
                  90deg,
                  rgb(126_34_206),
                  rgb(126_34_206_/_0.55),
                  rgb(126_34_206),
                  rgb(126_34_206_/_0.55)
                )]
                bg-clip-text
              "
            >
              Oops!
            </span>
          </h1>

          {/* Title */}
          <h2
            className="
              hero-rise mt-6

              text-balance
              text-2xl font-semibold tracking-tight text-foreground
              sm:text-3xl
            "
            style={{ animationDelay: "0.35s" }}
          >
            An unexpected error occurred
          </h2>

          {/* Description */}
          <p
            className="
              hero-rise mt-4 max-w-xl

              text-pretty text-base leading-7 text-muted-foreground
              md:text-lg md:leading-8
            "
            style={{ animationDelay: "0.45s" }}
          >
            Our team has been notified. You can try again, or head back home if
            the problem persists.
          </p>

          {/* Digest / error id (dev-friendly, safe to show) */}
          {(error.digest || process.env.NODE_ENV === "development") && (
            <p
              className="hero-rise mt-4 font-mono text-xs text-muted-foreground/70"
              style={{ animationDelay: "0.5s" }}
            >
              {error.digest
                ? `Error ID: ${error.digest}`
                : `Dev: ${error.message}`}
            </p>
          )}

          {/* Buttons */}
          <div
            className="
              hero-rise mt-9

              flex w-full flex-col items-center gap-3

              sm:w-auto sm:flex-row
            "
            style={{ animationDelay: "0.55s" }}
          >
            {/* Primary — Try again (calls reset) */}
            <button
              type="button"
              onClick={reset}
              className={cn(
                buttonVariants({ size: "lg" }),
                `
                  group relative w-full overflow-hidden sm:w-auto

                  shadow-lg shadow-purple-700/10

                  transition-all duration-300

                  hover:-translate-y-0.5
                  hover:shadow-xl hover:shadow-purple-700/20
                `,
              )}
            >
              <span
                className="
                  button-shine pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 rotate-12

                  bg-gradient-to-r from-transparent via-white/25 to-transparent
                "
              />

              <span className="relative flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Try again
              </span>
            </button>

            {/* Secondary — Home */}
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                `
                  w-full sm:w-auto

                  border-border bg-background/60

                  backdrop-blur-sm

                  transition-all duration-300

                  hover:-translate-y-0.5
                  hover:border-purple-700/30
                  hover:bg-purple-700/[0.04]
                `,
              )}
            >
              <Home className="mr-2 h-4 w-4" />
              Back to home
            </Link>
          </div>

          {/* Quick links */}
          <div
            className="hero-rise mt-14 w-full border-t border-border/60 pt-6"
            style={{ animationDelay: "0.7s" }}
          >
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Popular destinations
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {QUICK_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="
                      rounded-full border border-border/60 bg-card/60
                      px-3.5 py-1.5

                      text-sm text-muted-foreground

                      transition-colors

                      hover:border-purple-700/40
                      hover:bg-purple-700/[0.05]
                      hover:text-foreground

                      focus-visible:outline-none focus-visible:ring-2
                      focus-visible:ring-ring focus-visible:ring-offset-2
                      focus-visible:ring-offset-background
                    "
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
