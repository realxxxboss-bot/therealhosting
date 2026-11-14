import { home } from "@/config/marketing";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "./section";

/** Closing band: one solid field of zaffre, left-aligned. */
export function CtaBand({ title = home.cta.title, body = home.cta.body }: { title?: string; body?: string }) {
  return (
    <section className="bg-band text-band-foreground">
      <Container className="grid gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:items-end">
        <Reveal className="lg:col-span-8">
          <h2 className="max-w-3xl text-title font-semibold">{title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">{body}</p>
        </Reveal>
        <div className="flex flex-wrap gap-3 lg:col-span-4 lg:justify-end">
          <ButtonLink href="/contact" size="lg" variant="inverse">
            Talk to us
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="inverse-outline">
            See plans
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
