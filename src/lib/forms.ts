import type { z } from "zod";

/** Standard result shape returned by server actions to forms. */
export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export const initialFormState: FormState = { ok: false };

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
