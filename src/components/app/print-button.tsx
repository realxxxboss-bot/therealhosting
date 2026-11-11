"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Download PDF" }: { label?: string }) {
  return (
    <Button variant="secondary" onClick={() => window.print()} className="print:hidden">
      <Download aria-hidden /> {label}
    </Button>
  );
}
