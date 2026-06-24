import { cn } from "@/lib/utils";

const Feature166 = ({
  title = "Why you'll love Explainer AI",
  description = "Every way to learn from your content, in one place.",

  feature1 = {
    title: "One Source, Every Format",
    description:
      "Turn a single article, video, or PDF into a summary, podcast, set of notes, quiz, deep explanation, or visualization. Pick whatever fits the moment.",
    image: "https://illustrations.popsy.co/amber/remote-work.svg",
  },

  feature2 = {
    title: "Learn On the Go",
    description:
      "Natural AI voices turn any article into a polished podcast or a Gen Z-style audio convo with Maya & Jay. Hit play and absorb it while you commute, cook, or relax.",
    image: "https://illustrations.popsy.co/amber/microphone.svg",
  },

  feature3 = {
    title: "Any Source Works",
    description:
      "Blog posts, news, research papers, YouTube videos, PDFs, or pasted text. If it has words, Explainer AI can read it, summarize it, and reshape it.",
    image: "https://illustrations.popsy.co/amber/paper-documents.svg",
  },

  feature4 = {
    title: "Make It Stick",
    description:
      "Auto-generated quizzes, structured notes, and deep explanations turn passive reading into real understanding. Everything saves to your library to revisit anytime.",
    image: "https://illustrations.popsy.co/amber/video-call.svg",
  },

  className
}) => {
  return (
    <section className={cn("py-20", className)}>
      <div className="container">
        <div className="mb-24 flex flex-col items-center gap-6">
          <h1 className="text-center text-3xl font-semibold lg:max-w-3xl lg:text-5xl">
            {title}
          </h1>
          <p
            className="text-center text-lg font-medium text-muted-foreground md:max-w-4xl lg:text-xl">
            {description}
          </p>
        </div>
        <div className="relative flex justify-center">
          <div
            className="border-muted2 relative flex w-full flex-col border md:w-1/2 lg:w-full">
            <div className="relative flex flex-col lg:flex-row">
              <div
                className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-3/5 lg:border-r lg:border-b-0">
                <h2 className="text-xl font-semibold">{feature1.title}</h2>
                <p className="text-muted-foreground">{feature1.description}</p>
                <img
                  src={feature1.image}
                  alt={feature1.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]" />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-2/5">
                <h2 className="text-xl font-semibold">{feature2.title}</h2>
                <p className="text-muted-foreground">{feature2.description}</p>
                <img
                  src={feature2.image}
                  alt={feature2.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover" />
              </div>
            </div>
            <div
              className="border-muted2 relative flex flex-col border-t border-solid lg:flex-row">
              <div
                className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-2/5 lg:border-r lg:border-b-0">
                <h2 className="text-xl font-semibold">{feature3.title}</h2>
                <p className="text-muted-foreground">{feature3.description}</p>
                <img
                  src={feature3.image}
                  alt={feature3.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-3/5">
                <h2 className="text-xl font-semibold">{feature4.title}</h2>
                <p className="text-muted-foreground">{feature4.description}</p>
                <img
                  src={feature4.image}
                  alt={feature4.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature166 };
