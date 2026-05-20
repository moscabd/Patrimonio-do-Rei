"use client";

import { FileDown } from "lucide-react";

export default function PdfButton() {
  return (
    <button
      onClick={() => window.open('/api/disposals-pdf', '_blank')}
      className="flex items-center gap-2 px-4 py-2.5 border border-secondary/30 text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/10 transition-all"
    >
      <FileDown className="w-4 h-4" /> Relatório PDF
    </button>
  );
}