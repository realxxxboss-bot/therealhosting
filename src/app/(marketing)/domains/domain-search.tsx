"use client";

import { useActionState } from "react";
import { searchDomains, type DomainSearchState } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { formatUSD } from "@/lib/utils";

const initial: DomainSearchState = { query: "", results: [] };

export function DomainSearch() {
  const [state, action, pending] = useActionState(searchDomains, initial);
  return (
    <div className="max-w-3xl">
      <form action={action} className="flex flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="q" className="sr-only">
          Domain name
        </label>
        <Input id="q" name="q" defaultValue={state.query} placeholder="yourbusiness.com" className="h-14 border-foreground/30 px-4 text-lg" autoComplete="off" autoCapitalize="none" spellCheck={false} aria-invalid={Boolean(state.error)} aria-describedby={state.error ? "q-error" : undefined} />
        <Button type="submit" size="lg" className="h-14 px-8" disabled={pending}>
          {pending ? "Searching…" : "Search"}
        </Button>
      </form>
      {state.error ? (
        <p id="q-error" className="mt-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <div aria-live="polite">
        {state.results.length > 0 ? (
          <div className="mt-10">
            <ul className="border-t border-foreground">
              {state.results.map((r) => (
                <li key={r.domain} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-border py-4 sm:grid-cols-[1fr_8rem_8rem]">
                  <span className="min-w-0 font-mono text-small font-medium break-all">{r.domain}</span>
                  <span className={r.available ? "font-medium text-success" : "text-muted"}>{r.available ? "Available" : "Taken"}</span>
                  <span className="col-span-2 text-muted tabular-nums sm:col-span-1 sm:text-right">{r.available && r.priceUsd ? `${formatUSD(r.priceUsd)} a year` : ""}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">Sample results while registration is being set up. Prices are indicative yearly prices, and they will be the same at renewal.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
