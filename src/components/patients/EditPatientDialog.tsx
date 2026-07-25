"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdatePatientMutation, Patient } from "@/store/services/apiService";
import { Loader2 } from "lucide-react";

const editSchema = z.object({
  name: z.string().min(2),
  age: z.number().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
  condition: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")),
  status: z.enum(["admitted", "discharged", "under-observation", "critical"]),
  bloodGroup: z.string().optional(),
  notes: z.string().max(1000).optional(),
  address: z.string().optional(),
});

type EditForm = z.infer<typeof editSchema>;

interface EditPatientDialogProps {
  patient: Patient | null;
  open: boolean;
  onClose: () => void;
}

export function EditPatientDialog({ patient, open, onClose }: EditPatientDialogProps) {
  const [updatePatient, { isLoading }] = useUpdatePatientMutation();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    values: patient
      ? {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          condition: patient.condition,
          phone: patient.phone,
          email: patient.email || "",
          status: patient.status,
          bloodGroup: patient.bloodGroup || "",
          notes: patient.notes || "",
          address: patient.address || "",
        }
      : undefined,
  });

  const onSubmit = async (data: EditForm) => {
    if (!patient) return;
    try {
      setServerError("");
      await updatePatient({ id: patient._id, data }).unwrap();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setServerError(error?.data?.error || "Failed to update patient");
    }
  };

  const handleClose = () => {
    reset();
    setServerError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-name">Patient Name</label>
              <Input id="edit-name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-age">Age</label>
              <Input id="edit-age" type="number" {...register("age", { valueAsNumber: true })} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Gender</label>
              <Select
                value={watch("gender")}
                onValueChange={(v) => setValue("gender", (v ?? "male") as EditForm["gender"])}
              >
                <SelectTrigger id="edit-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-condition">Condition</label>
              <Input id="edit-condition" {...register("condition")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-phone">Phone</label>
              <Input id="edit-phone" {...register("phone")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-email">Email</label>
              <Input id="edit-email" type="email" {...register("email")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={watch("status")}
                onValueChange={(v) => setValue("status", (v ?? "admitted") as EditForm["status"])}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="under-observation">Under Observation</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-blood">Blood Group</label>
              <Input id="edit-blood" {...register("bloodGroup")} />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-address">Address</label>
              <Input id="edit-address" {...register("address")} />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="edit-notes">Notes</label>
              <textarea
                id="edit-notes"
                className="w-full min-h-[70px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                {...register("notes")}
              />
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{serverError}</p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              id="edit-patient-submit-btn"
              disabled={isLoading}
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.16 160), oklch(0.52 0.18 220))" }}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
