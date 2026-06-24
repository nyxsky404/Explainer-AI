import { Asterisk, CornerDownRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

const Process1 = ({
  className
}) => {
  const process = [
    {
      step: "01",
      title: "Bring Your Source",
      description:
        "Drop in a URL, YouTube link, PDF, or paste text directly. Blogs, news, docs, research papers — if it has words, it works.",
    },
    {
      step: "02",
      title: "The AI Reads It",
      description:
        "We analyze the content to identify key points, structure, tone, and context — so everything we generate actually makes sense.",
    },
    {
      step: "03",
      title: "Pick Your Output",
      description:
        "Choose a summary, podcast, set of notes, quiz, deep explanation, or visualization. Mix and match as many as you like.",
    },
    {
      step: "04",
      title: "Learn & Revisit",
      description:
        "Read it, listen on the go, study from notes, or quiz yourself. Everything saves to your library — and you can share it with a link.",
    },
  ];

  return (
    <section className={cn("py-20", className)} id="process">
      <div className="container">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-6 lg:gap-20">
          <div className="top-10 col-span-2 h-fit w-fit gap-3 space-y-7 py-8 lg:sticky">
            <div
              className="relative w-fit text-5xl font-semibold tracking-tight lg:text-7xl">
              {" "}
              <h1 className="w-fit">How It Works</h1>
              <Asterisk
                className="absolute -top-2 -right-2 size-5 text-orange-500 md:size-10 lg:-right-14" />
            </div>
            <p className="text-base text-muted-foreground">
              Four simple steps between any piece of content and the format you learn best from. No setup, no friction.
            </p>

            <Button variant="ghost" className="flex items-center justify-start gap-2" asChild>
              <Link to="/signup">
                <CornerDownRight className="text-orange-500" />
                Try it free
              </Link>
            </Button>
          </div>
          <ul className="relative col-span-4 w-full lg:pl-22">
            {process.map((step, index) => (
              <li
                key={index}
                className="relative flex flex-col justify-between gap-10 border-t py-8 md:flex-row lg:py-10">
                <Illustration className="absolute top-4 right-0" />

                <div
                  className="flex size-12 items-center justify-center bg-muted px-4 py-1 tracking-tighter">
                  0{index + 1}
                </div>
                <div className="">
                  <h3 className="mb-4 text-2xl font-semibold tracking-tighter lg:text-3xl">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export { Process1 };

const Illustration = (props) => {
  return (
    <svg
      width="22"
      height="20"
      viewBox="0 0 22 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
      <line
        x1="0.607422"
        y1="2.57422"
        x2="21.5762"
        y2="2.57422"
        stroke="#FF0000"
        strokeWidth="4" />
      <line
        x1="19.5762"
        y1="19.624"
        x2="19.5762"
        y2="4.57422"
        stroke="#FF0000"
        strokeWidth="4" />
    </svg>
  );
};
