import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Faq1 = ({
  heading = "Got questions? We've got answers.",

  items = [
    {
      id: "faq-1",
      question: "What kind of content can I convert to podcasts?",
      answer:
        "Pretty much anything with text! Blog posts, news articles, documentation, research papers, even long Twitter threads (if you're into that). If it's on the web and has words, we can turn it into audio.",
    },
    {
      id: "faq-2",
      question: "How long does it take to generate a podcast?",
      answer:
        "Usually under 5 minutes for most articles. Longer content might take a bit more, but we're talking minutes, not hours. Grab a coffee and it'll be ready when you get back.",
    },
    {
      id: "faq-3",
      question: "Do the AI voices sound robotic?",
      answer:
        "Nope! We use advanced text-to-speech technology that produces natural, human-like voices. No more robot uprising vibes. Just smooth, professional narration.",
    },
    {
      id: "faq-4",
      question: "Can I download the podcasts?",
      answer:
        "Absolutely! Download your podcasts as audio files, share them via link, or embed them on your website. Your content, your rules.",
    },
    {
      id: "faq-5",
      question: "Is there a free plan?",
      answer:
        "Yes! You can create up to 10 podcasts per month on our free tier. Perfect for trying things out or casual use. Need more? We've got plans for that too.",
    },
    {
      id: "faq-6",
      question: "What about copyright and content ownership?",
      answer:
        "You retain full ownership of your generated podcasts. Just make sure you have the right to use the source content. We're not lawyers, but we trust you to do the right thing.",
    },
    {
      id: "faq-7",
      question: "Can I use this for my business?",
      answer:
        "100%! Many users convert their blog content into podcasts for wider reach. It's a great way to repurpose content and reach audiences who prefer listening over reading.",
    },
  ],

  className
}) => {
  return (
    <section className={cn("py-20", className)} id="faq">
      <div className="container max-w-3xl">
        <h1 className="mb-4 text-3xl font-semibold md:mb-11 md:text-4xl">
          {heading}
        </h1>
        <Accordion type="single" collapsible>
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="font-semibold hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export { Faq1 };
