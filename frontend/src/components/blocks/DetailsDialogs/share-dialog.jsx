import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, ExternalLink, Link } from "lucide-react";
import { useRef, useState } from "react";

export default function ShareDialog({ open, onOpenChange, url }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Podcast</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Copy the link below to share this podcast
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="share-link" className="sr-only">
              Share Link
            </Label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="share-link"
                readOnly
                value={url}
                className="pe-9" />
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleCopy}
                      className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
                      aria-label={copied ? "Copied" : "Copy to clipboard"}
                      disabled={copied}>
                      <div
                        className={cn("transition-all", copied ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                        <CheckIcon className="text-primary" size={16} aria-hidden="true" />
                      </div>
                      <div
                        className={cn(
                          "absolute transition-all",
                          copied ? "scale-0 opacity-0" : "scale-100 opacity-100"
                        )}>
                        <CopyIcon size={16} aria-hidden="true" />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    {copied ? "Copied!" : "Copy to clipboard"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button className="flex-1 gap-2" onClick={handleCopy}>
              <Link className="h-4 w-4" />
              Copy Link
            </Button>
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Preview
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
