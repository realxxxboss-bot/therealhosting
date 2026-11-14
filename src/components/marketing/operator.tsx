import { isConfirmed, operatorStatement, site } from "@/config/site";

/** "Who we are" sentence for the legal documents. Never shows a placeholder. */
export function OperatorIdentity() {
  const statement = operatorStatement();
  return (
    <p>
      {statement ?? `${site.name} is not yet registered as a company. Our full business name and postal address will be published here before we accept the first paid order.`}{" "}
      {isConfirmed(site.operatorCountry) ? `We are based in ${site.operatorCountry}. ` : ""}
      You can reach us at <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
    </p>
  );
}
