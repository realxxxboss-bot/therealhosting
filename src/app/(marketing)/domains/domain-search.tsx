"use client";

import { useActionState } from "react";
import { Search } from "lucide-react";
import { searchDomains, type DomainSearchState } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/badge";
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
        <Input id="q" name="q" defaultValue={state.query} placeholder="yourbusiness.com" className="h-12 text-base" autoComplete="off" aria-invalid={Boolean(state.error)} aria-describedby={state.error ? "q-error" : undefined} />
        <Button type="submit" size="lg" disabled={pending}>
          <Search aria-hidden /> {pending ? "Searching…" : "Search"}
        </Button>
      </form>
      {state.error ? (
        <p id="q-error" className="mt-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.results.length > 0 ? (
        <div className="mt-6" aria-live="polite">
          <p className="mb-3 text-xs text-muted">Demo results. Prices are indicative yearly prices, the same on renewal.</p>
          <ul className="divide-y divide-border rounded-[16px] border border-border bg-surface">
            {state.results.map((r) => (
              <li key={r.domain} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span className="min-w-0 flex-1 font-mono text-sm">{r.domain}</span>
                {r.available ? <StatusBadge tone="success" label="Available" /> : <StatusBadge tone="neutral" label="Taken" />}
                <span className="w-24 text-right text-sm">{r.available && r.priceUsd ? `${formatUSD(r.priceUsd)}/yr` : "—"}</span>
                <Button size="sm" variant="secondary" disabled title="Domain registration is coming soon">
                  Coming soon
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
