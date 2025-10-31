import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function MembershipActionModal({ isOpen, onClose, actionType }) {
  const isAnnualSwitch = actionType === "annual";
  const isCancellation = actionType === "cancel";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isAnnualSwitch ? "Switch to Annual Membership" : "Cancel Membership"}
          </DialogTitle>
          <DialogDescription>
            {isAnnualSwitch
              ? "Save more with an annual subscription"
              : "We're sorry to see you go"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {/* Placeholder for the form that will be provided later */}
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <p className="text-sm text-muted-foreground">
                Form content will be added here
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Action type: <span className="font-semibold">{actionType}</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MembershipActionModal;

