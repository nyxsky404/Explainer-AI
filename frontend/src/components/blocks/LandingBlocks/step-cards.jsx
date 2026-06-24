import { Link2, Sparkles, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

const Feature13 = ({
  title = "How It Works",
  description = "From any source to the format that works for you — in three steps.",
  features = [
    {
      id: "feature-1",
      heading: "Drop a source",
      label: "STEP 01",
      description:
        "Paste a URL, YouTube link, PDF, or raw text. If it has words, Explainer AI can break it down.",
      icon: Link2,
    },
    {
      id: "feature-2",
      heading: "Pick a format",
      label: "STEP 02",
      description:
        "Summary, podcast, notes, quiz, deep explanation, or visual. Our AI reads, understands, and reshapes the content.",
      icon: Sparkles,
    },
    {
      id: "feature-3",
      heading: "Learn your way",
      label: "STEP 03",
      description:
        "Read the summary, listen on the go, study from notes, or test yourself with a quiz. It all lands in your library.",
      icon: GraduationCap,
    },
  ],
  className,
}) => {
  return (
    <section className={cn("py-20", className)} id="features">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl font-semibold md:text-4xl lg:text-5xl mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground lg:text-lg">
              {description}
            </p>
          )}
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="flex flex-col justify-between rounded-lg bg-[#f5f5f5]"
              >
                <div className="flex justify-between gap-6 border-b border-[#e0e0e0]">
                  <div className="flex flex-col justify-between gap-6 py-6 pl-6 md:py-8 md:pl-8">
                    <span className="font-mono text-xs text-[#6a6a6a]">
                      {feature.label}
                    </span>
                    <h3 className="text-xl font-semibold md:text-2xl text-[#161716]">
                      {feature.heading}
                    </h3>
                  </div>
                  <div className="w-1/3 shrink-0 rounded-tr-lg border-l border-[#e0e0e0] bg-[#e8e8e8] flex items-center justify-center p-4">
                    <Icon className="size-12 text-[#161716]" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="p-6 text-[#666666] md:p-8">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Feature13 };
