// import React from 'react'

// function userwalletFrom() {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default userwalletFrom

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { adminAddBalance } from "@/features/wallet/walletThunk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface UserwalletFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: any;
  onSuccess?: () => void;
}

function UserwalletForm({
  open,
  onOpenChange,
  selectedUser,
  onSuccess,
}: UserwalletFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }
    try {
      setSubmitting(true);
      await dispatch(
        adminAddBalance({
          userId: selectedUser._id,
          amount: Number(amount),
        }),
      ).unwrap();
      toast.success("Balance added successfully");
      setAmount("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err || "Failed to add balance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!submitting) {
          onOpenChange(val);
          if (!val) setAmount("");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Balance — {selectedUser?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Adding..." : "Add Balance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserwalletForm;