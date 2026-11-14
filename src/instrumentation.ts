import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { checkEnv } = await import("./lib/env-check");
  for (const problem of checkEnv(process.env)) {
    const line = `[config] ${problem.message}`;
    if (problem.level === "error") console.error(line);
    else console.warn(line);
  }
}

/**
 * Every server error, in one structured line for the platform's log drain. The digest matches the
 * reference shown to the visitor on the error page. Swap in Sentry here when an account exists.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const err = error as Error & { digest?: string };
  console.error(
    JSON.stringify({
      level: "error",
      event: "request_error",
      digest: err.digest,
      message: err.message,
      method: request.method,
      path: request.path,
      route: context.routePath,
      kind: context.routeType,
    }),
  );
};
