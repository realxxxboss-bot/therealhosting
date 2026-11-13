import { providers, providerStatusLabel } from "@/config/providers";

/** The provider table used in the Privacy Policy and the sub-processor list. */
export function ProvidersTable({ clientContentOnly = false }: { clientContentOnly?: boolean }) {
  const rows = clientContentOnly ? providers.filter((p) => p.processesClientContent) : providers;
  return (
    <table>
        <thead>
          <tr>
            <th scope="col">Provider</th>
            <th scope="col">What they do for us</th>
            <th scope="col">Data</th>
            <th scope="col">Where</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.name}>
              <td>{p.name}</td>
              <td>{p.purpose}</td>
              <td>{p.data}</td>
              <td>{p.location}</td>
              <td>{providerStatusLabel[p.status]}</td>
            </tr>
          ))}
        </tbody>
    </table>
  );
}
