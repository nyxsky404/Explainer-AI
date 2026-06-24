import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

/**
 * Compact, tappable card used to render library/table rows on mobile where a
 * multi-column table doesn't fit. The whole card links to the detail view.
 */
export default function LibraryItemCard({ icon, title, badge, date, to, hasExternal = false }) {
  return (
    <Link to={to} className="block">
      <Card className="hover:border-primary transition-colors">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span className="font-medium text-sm wrap-break-word line-clamp-2 flex-1">
              {title}
            </span>
            {hasExternal && (
              <ExternalLink className="size-3 shrink-0 mt-1 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            {badge}
            <span className="text-xs text-muted-foreground shrink-0">{date}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
