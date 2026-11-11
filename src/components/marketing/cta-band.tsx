import { home } from "@/config/marketing";
import { ButtonLink } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-[24px] bg-zaffre-950 px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_80%_0%,rgb(62_76_247/55%),transparent_70%)]" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">{home.cta.title}</h2>
          <p className="mt-4 text-lg text-zaffre-100">{home.cta.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact" size="lg" className="bg-white text-zaffre-900 hover:bg-zaffre-50">
              Talk to us
            </ButtonLink>
            <ButtonLink href="/pricing" size="lg" variant="ghost" className="text-white hover:bg-white/10">
              Compare plans
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
