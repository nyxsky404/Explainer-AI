import { cn } from "@/lib/utils";

const Feature166 = ({
  title = "Why you'll love Explainer AI",
  description = "Podcast production used to take days. Now it takes a click.",

  feature1 = {
    title: "Lightning Fast",
    description:
      "Podcasts at the speed of thought. Go from URL to finished episode in under 5 minutes. That's faster than your coffee brewing. (We timed it.)",
    image: "https://illustrations.popsy.co/amber/remote-work.svg",
  },

  feature2 = {
    title: "Natural Voices",
    description:
      "Voices so real, they breathe. Forget robotic monotones. Our AI hosts have personality, comedic timing, and the occasional dramatic flair.",
    image: "https://illustrations.popsy.co/amber/microphone.svg",
  },

  feature3 = {
    title: "Any Content Works",
    description:
      "Fluency in every format. Dense research papers, breezy blog posts, or technical docs. If it has words, we make it talk.",
    image: "https://illustrations.popsy.co/amber/paper-documents.svg",
  },

  feature4 = {
    title: "Share Anywhere",
    description:
      "Your content, unbound. Download the MP3, embed the player, or share the link. Take your content where eyes can't go, but ears can.",
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
