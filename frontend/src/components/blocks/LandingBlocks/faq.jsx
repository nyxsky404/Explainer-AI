import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq1 = ({
  heading = "Got questions?",

  items = [
    {
      id: "faq-1",
      question: "What can Explainer AI do?",
      answer:
        "Explainer AI turns any content into the format you learn best from — summaries, podcasts, structured notes, quizzes, deep explanations, and visualizations. Bring a source once and generate as many formats as you need.",
    },
    {
      id: "faq-2",
      question: "What kind of sources can I use?",
      answer:
        "Blog posts, news articles, documentation, research papers, YouTube videos, PDFs, or just pasted text. If it has words, we can read it, summarize it, and reshape it.",
    },
    {
      id: "faq-3",
      question: "Do the AI podcast voices sound robotic?",
      answer:
        "Nope! We use advanced text-to-speech that produces natural, human-like voices — whether you want a polished podcast or a casual Gen Z-style convo between our hosts Maya & Jay.",
    },
    {
      id: "faq-4",
      question: "How long does it take to generate something?",
      answer:
        "Summaries and notes are usually ready in well under a minute. Podcasts and longer content take a few minutes since we generate audio. Either way, we're talking minutes, not hours.",
    },
    {
      id: "faq-5",
      question: "Can I save, download, and share what I create?",
      answer:
        "Yes. Everything you generate is saved to your library. Download podcasts as audio, export summaries and notes, or share any item with a public link.",
    },
    {
      id: "faq-6",
      question: "Is there a free plan?",
      answer:
        "Yes! Every account starts with monthly credits you can spend across any tool — podcasts, summaries, notes, quizzes, and more. Perfect for trying things out, with more available when you need it.",
    },
    {
      id: "faq-7",
      question: "Is there a browser extension?",
      answer:
        "Yes! Summarize or explain whatever you're reading without leaving the page — the extension sends the content straight into Explainer AI for you.",
    },
  ],

  className
}) => {
  return (
    <section className={cn("py-20", className)} id="faq">
      <div className="container">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-4 text-3xl font-semibold md:text-4xl lg:text-5xl md:mb-11 text-center">
            {heading}
          </h1>
          <Accordion type="single" collapsible>
            {items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-semibold hover:no-underline text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base lg:text-lg">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export { Faq1 };
