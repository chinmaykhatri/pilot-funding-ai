import { FormalLoanApplication } from "@/lib/loan-application-generator";
import { FileText, Copy, Check, Printer } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface LoanApplicationViewProps {
  application: FormalLoanApplication;
}

const LoanApplicationView = ({ application }: LoanApplicationViewProps) => {
  const [copied, setCopied] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(application.fullLetterText);
    } catch {
      // Fallback for insecure contexts (HTTP in demo)
      const t = document.createElement("textarea");
      t.value = application.fullLetterText;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
      <head>
        <title>Loan Application - ${application.businessName}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; font-size: 14px; line-height: 1.8; padding: 50px 60px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
          .header { margin-bottom: 30px; }
          .header p { margin: 2px 0; }
          .subject { font-weight: bold; margin: 20px 0; text-decoration: underline; }
          .salutation { margin: 15px 0; }
          .section { margin-bottom: 20px; }
          .section h3 { font-size: 14px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; }
          .section p { margin: 0 0 8px 0; text-align: justify; }
          .financial-table { margin: 10px 0; }
          .financial-table p { margin: 2px 0; padding-left: 15px; }
          .closing { margin-top: 40px; }
          .signature { margin-top: 50px; }
          .signature p { margin: 3px 0; }
          @media print { body { padding: 30px 40px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <p>Date: ${application.date}</p>
          <br />
          <p>To</p>
          <p>The Branch Manager</p>
          <p>[Bank / Financial Institution Name]</p>
          <p>[Branch Address]</p>
        </div>
        <p class="subject">Subject: ${application.subject}</p>
        <p class="salutation">Dear Sir/Madam,</p>
        <div class="section"><h3>1. Business Introduction</h3><p>${application.sections.businessIntroduction}</p></div>
        <div class="section"><h3>2. Funding Requirement</h3><p>${application.sections.fundingRequirement}</p></div>
        <div class="section"><h3>3. Financial Summary</h3><p>${application.sections.financialSummary.replace(/\n/g, '<br/>').replace(/•/g, '&bull;')}</p></div>
        <div class="section"><h3>4. Repayment Capability</h3><p>${application.sections.repaymentCapability}</p></div>
        <div class="section"><h3>5. Request for Consideration</h3><p>${application.sections.requestForConsideration}</p></div>
        <p class="closing">Thank you for your time and consideration.</p>
        <div class="signature">
          <p>Yours faithfully,</p>
          <br/><br/>
          <p>For <strong>${application.businessName}</strong></p>
          <p>Authorized Signatory</p>
          <p>Name: ____________</p>
          <p>Contact: ____________</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const sectionItems = [
    { number: "1", title: "Business Introduction", content: application.sections.businessIntroduction },
    { number: "2", title: "Funding Requirement", content: application.sections.fundingRequirement },
    { number: "3", title: "Financial Summary", content: application.sections.financialSummary },
    { number: "4", title: "Repayment Capability", content: application.sections.repaymentCapability },
    { number: "5", title: "Request for Consideration", content: application.sections.requestForConsideration },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-card animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-5">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-card-foreground">
            Formal Loan Application Letter
          </h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print
          </Button>
        </div>
      </div>

      {/* Letter Body */}
      <div ref={letterRef} className="p-6 space-y-0">
        {/* Letter Header */}
        <div className="mb-5 rounded-lg bg-muted/30 p-4 font-mono text-sm text-card-foreground">
          <p>Date: {application.date}</p>
          <div className="mt-3">
            <p>To</p>
            <p>The Branch Manager</p>
            <p className="text-muted-foreground">[Bank / Financial Institution Name]</p>
            <p className="text-muted-foreground">[Branch Address]</p>
          </div>
          <p className="mt-3 font-semibold underline">Subject: {application.subject}</p>
          <p className="mt-3">Dear Sir/Madam,</p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sectionItems.map((s) => (
            <div key={s.number} className="rounded-lg border border-border bg-muted/20 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {s.number}
                </span>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {s.title}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-line">
                {s.content}
              </p>
            </div>
          ))}
        </div>

        {/* Closing & Signature */}
        <div className="mt-5 rounded-lg bg-muted/30 p-4 font-mono text-sm text-card-foreground">
          <p>Thank you for your time and consideration.</p>
          <div className="mt-6">
            <p>Yours faithfully,</p>
            <div className="mt-4">
              <p className="font-semibold">For {application.businessName}</p>
              <p>Authorized Signatory</p>
              <p className="text-muted-foreground">Name: ____________</p>
              <p className="text-muted-foreground">Contact: ____________</p>
            </div>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            Key Calculations
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Annual Revenue: </span>
              <span className="font-medium text-card-foreground">₹{application.calculations.annualRevenue.toLocaleString("en-IN")}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Monthly Surplus: </span>
              <span className={`font-medium ${application.calculations.isDeficit ? "text-destructive" : "text-success"}`}>
                {application.calculations.isDeficit ? "Deficit" : `₹${application.calculations.monthlySurplus.toLocaleString("en-IN")}`}
              </span>
            </div>
            <div className="text-sm sm:col-span-2">
              <span className="text-muted-foreground">Estimated Comfortable EMI: </span>
              <span className="font-medium text-card-foreground">{application.calculations.estimatedEMI}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationView;
