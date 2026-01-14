import { Link2, Sparkles, Headphones } from "lucide-react";

import { cn } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Feature51 = ({
  features = [
    {
      id: "feature-1",
      heading: "Paste",
      icon: <Link2 className="size-4" />,
      description:
        "If you can link it, we can voice it. Blogs, docs, or news. Turn static text into audio gold instantly.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
      isDefault: true,
    },
    {
      id: "feature-2",
      icon: <Sparkles className="size-4" />,
      heading: "Generate",
      description:
        "Studio quality, sans studio. Our AI doesn't just read; it comprehends. It scripts, paces, and performs like a human host.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
      isDefault: false,
    },
    {
      id: "feature-3",
      icon: <Headphones className="size-4" />,
      heading: "Listen",
      description:
        "Conquer your reading list. Lean back, hit play, and finally absorb that article while you drive, cook, or relax.",
      image: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
      isDefault: false,
    },
  ],

  className
}) => {
  const defaultTab =
    features.find((tab) => tab.isDefault)?.id || features[0].id;

  return (
    <section className={cn("py-20", className)} id="features">
      <div className="container">
        <Tabs defaultValue={defaultTab} className="p-0">
          <TabsList
            className="flex h-auto w-full flex-col gap-2 bg-background p-0 md:flex-row">
            {features.map((tab) => {
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`group flex w-full flex-col items-start justify-start gap-1 rounded-md border p-4 text-left whitespace-normal shadow-none transition-opacity duration-200 hover:border-muted hover:opacity-80 data-[state=active]:bg-muted data-[state=active]:shadow-none ${tab.isDefault ? "" : ""
                    }`}>
                  <div className="flex items-center gap-2 md:flex-col md:items-start lg:gap-4">
                    {tab.icon && (
                      <span
                        className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-opacity duration-200 group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground lg:size-10">
                        {tab.icon}
                      </span>
                    )}
                    <p
                      className="text-lg font-semibold transition-opacity duration-200 md:text-2xl lg:text-xl">
                      {tab.heading}
                    </p>
                  </div>
                  <p
                    className="font-normal text-muted-foreground transition-opacity duration-200 md:block">
                    {tab.description}
                  </p>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {features.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="transition-opacity duration-300">
              <img
                src={tab.image}
                alt={tab.heading}
                className="aspect-video w-full rounded-md object-cover transition-opacity duration-300" />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export { Feature51 };
