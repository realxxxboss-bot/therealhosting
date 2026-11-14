import { site, socialProfiles } from "@/config/site";
import { cn } from "@/lib/utils";

/** Text links to our social profiles. Plain words instead of logos, so they read on any background. */
export function SocialLinks({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2 text-small", className)}>
      {socialProfiles().map((p) => (
        <li key={p.label}>
          <a
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.name} on ${p.label}`}
            className={cn(
              "underline underline-offset-4 transition-colors duration-200",
              tone === "dark" ? "text-white/90 decoration-white/30 hover:decoration-white" : "decoration-border hover:decoration-foreground",
            )}
          >
            {p.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
