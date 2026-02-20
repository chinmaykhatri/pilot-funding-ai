import { LoanApplication as LAType } from "@/lib/financial-calculations";
import { FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface LoanApplicationViewProps {
  application: LAType;
}

const LoanApplicationView = ({ application }: LoanApplicationViewProps) => {
  const [copied, setCopied] = useState(false);

  const fullText = `LOAN APPLICATION DRAFT

BUSINESS SUMMARY
${application.businessSummary}

FUNDING REQUIREMENT
${application.fundingRequirement}

FINANCIAL JUSTIFICATION
${application.financialJustification}

REPAYMENT CAPABILITY
${application.repaymentCapability}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { title: "Business Summary", content: application.businessSummary },
    { title: "Funding Requirement", content: application.fundingRequirement },
    { title: "Financial Justification", content: application.financialJustification },
    { title: "Repayment Capability", content: application.repaymentCapability },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-card-foreground">
            Loan Application Draft
          </h3>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {s.title}
            </p>
            <p className="text-sm leading-relaxed text-card-foreground">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanApplicationView;
