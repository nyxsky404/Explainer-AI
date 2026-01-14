import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

export default function DeleteAccountDialog({ open, onOpenChange, password, onPasswordChange, onDelete, isDeleting }) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All your data including podcasts will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onDelete(); }}>
          <div>
            <Label htmlFor="delete-account" className="text-sm font-medium">
              Enter your password to confirm
            </Label>
            <div className="relative mt-2">
              <Input
                id="delete-account"
                name="delete-account"
                type={isVisible ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="pe-9" />
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
                aria-controls="delete-account">
                {isVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" variant="destructive" className="w-full" disabled={isDeleting}>
              Delete Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
