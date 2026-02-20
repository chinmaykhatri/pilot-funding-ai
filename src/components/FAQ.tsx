import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
    {
        q: "What does FinPilot.ai do?",
        a: "FinPilot analyzes your business finances using deterministic formulas and AI to determine funding readiness. It provides a readiness score, funding recommendations, loan application drafts, rejection risk analysis, and an actionable improvement roadmap.",
    },
    {
        q: "Is my financial data secure?",
        a: "Yes. All core calculations run locally in your browser — your numbers never leave your device. Only a minimal summary request is sent to the AI gateway for the executive summary, and no financial data is stored on external servers.",
    },
    {
        q: "Do I need accounting software to use this?",
        a: "No. You can manually enter your monthly revenue, expenses, cash balance, and debt. If you're unsure, use the 'Try Demo' button to see how it works with sample data first.",
    },
    {
        q: "Does FinPilot apply for loans automatically?",
        a: "No. FinPilot prepares insights, risk analysis, and a bank-ready loan application draft that you can print or copy. You still submit the application yourself, but you'll be far better prepared.",
    },
    {
        q: "How accurate is the funding readiness score?",
        a: "The score uses a deterministic formula: Runway Factor (40%) + Cash Flow Health (30%) + Debt Ratio (30%). It's consistent and reproducible — the same inputs always produce the same score. No randomness, no hallucinations.",
    },
    {
        q: "Can startups use FinPilot?",
        a: "Absolutely. FinPilot is designed for both startups and established MSMEs. Early-stage businesses benefit from understanding their financial position before approaching lenders or investors.",
    },
    {
        q: "What funding options can FinPilot suggest?",
        a: "Based on your risk profile and funding goal, FinPilot recommends bank term loans, government MSME schemes (CGTMSE, SIDBI, SBI), working capital facilities, or investor funding — with official links and eligibility guidance.",
    },
    {
        q: "Can I edit the generated loan application?",
        a: "Yes. The loan application is generated as text that you can copy and modify. You can also print it directly as a formal bank-ready document in Times New Roman format.",
    },
    {
        q: "Is FinPilot free to use?",
        a: "The current prototype is completely free. Future versions may include premium features like historical tracking, multi-scenario analysis, and direct lender integrations.",
    },
    {
        q: "Does FinPilot support government MSME schemes?",
        a: "Yes. FinPilot recommends relevant government schemes based on your financial profile, including CGTMSE (Credit Guarantee), SIDBI programs, SBI MSME loans, and Mudra loans — with direct links to official portals.",
    },
];

const FAQ = () => {
    return (
        <section className="border-t border-border py-20">
            <div className="mx-auto max-w-3xl px-6">
                <div className="mb-10 text-center">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                        <HelpCircle className="h-3.5 w-3.5" />
                        FAQs
                    </div>
                    <h2 className="mb-3 font-heading text-3xl font-bold text-foreground">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground">
                        Everything you need to know about FinPilot.ai
                    </p>
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                    {faqs.map((faq, i) => (
                        <AccordionItem
                            key={i}
                            value={`faq-${i}`}
                            className="rounded-xl border border-border bg-card px-5 shadow-card card-interactive data-[state=open]:shadow-card-hover"
                        >
                            <AccordionTrigger className="py-4 text-left font-heading text-[15px] font-semibold text-card-foreground hover:no-underline">
                                {faq.q}
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                                {faq.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
};

export default FAQ;
