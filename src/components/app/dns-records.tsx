import type { DnsRecord } from "@/lib/adapters/types";
import { CopyButton } from "@/components/ui/copy-button";

export function DnsRecordsTable({ records, status }: { records: DnsRecord[]; status?: boolean[] }) {
  return (
    <div className="overflow-x-auto rounded-[12px] border border-border">
      <table className="w-full min-w-[560px] text-sm">
        <thead className="bg-surface-2 text-left text-xs text-muted">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Type</th>
            <th scope="col" className="px-3 py-2 font-medium">Name / Host</th>
            <th scope="col" className="px-3 py-2 font-medium">Value / Points to</th>
            {status ? <th scope="col" className="px-3 py-2 font-medium">Status</th> : null}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={`${r.type}-${r.name}-${r.value}`} className="border-t border-border">
              <td className="px-3 py-2.5 font-mono text-xs font-semibold">
                {r.type}
                {r.priority !== undefined ? <span className="ml-1 font-normal text-muted">({r.priority})</span> : null}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs">{r.name}</code>
                  <CopyButton value={r.name} />
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs break-all">{r.value}</code>
                  <CopyButton value={r.value} />
                </div>
              </td>
              {status ? (
                <td className="px-3 py-2.5 text-xs font-medium">
                  {status[i] ? <span className="text-success">✓ Found</span> : <span className="text-warning">Missing</span>}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
