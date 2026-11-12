ALTER TABLE "domains" ADD COLUMN "provider_ref" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "deploy_ref" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "monitor_ref" text;