"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import { useCreatePatientMutation } from "@/store/services/apiService";
import { Doctor } from "@/store/services/apiService";
import { Loader2 } from "lucide-react";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  age: z.number().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
  condition: z.string().min(2, "Condition is required"),
  phone: z.string().min(7, "Valid phone required"),
  email: z.string().email().optional().or(z.literal("")),
  doctorId: z.string().min(1, "Please select a doctor"),
  status: z.enum(["admitted", "discharged", "under-observation", "critical"]),
  bloodGroup: z.string().optional(),
  notes: z.string().max(1000).optional(),
  address: z.string().optional(),
});

type PatientForm = z.infer<typeof patientSchema>;

interface AddPatientDialogProps {
  open: boolean;
  onClose: () => void;
  doctors: Doctor[];
  preSelectedDoctorId?: string;
}

export function AddPatientDialog({
  open,
  onClose,
  doctors,
  preSelectedDoctorId,
}: AddPatientDialogProps) {
  const [createPatient, { isLoading }] = useCreatePatientMutation();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "male",
      status: "admitted",
      doctorId: preSelectedDoctorId || "",
    },
  });

  const onSubmit = async (data: PatientForm) => {
    try {
      setServerError("");
      await createPatient(data).unwrap();
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setServerError(error?.data?.error || "Failed to add patient");
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
          <DialogTitle className="text-lg font-semibold">Add New Patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="pat-name">Patient Name</label>
              <Input id="pat-name" placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="pat-age">Age</label>
              <Input id="pat-age" type="number" placeholder="35" {...register("age", { valueAsNumber: true })} />
              {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Gender</label>
              <Select
                defaultValue={watch("gender")}
                onValueChange={(v) => setValue("gender", (v ?? "male") as "male" | "female" | "other")}
              >
                <SelectTrigger id="pat-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="pat-condition">Condition</label>
              <Input id="pat-condition" placeholder="Hypertension" {...register("condition")} />
              {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="pat-phone">Phone</label>
              <Input id="pat-phone" placeholder="+1234567890" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="pat-email">Email (optional)</label>
              <Input id="pat-email" type="email" placeholder="patient@email.com" {...register("email")} />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Assigned Doctor</label>
              <Select
                defaultValue={preSelectedDoctorId}
                onValueChange={(v) => setValue("doctorId", v ?? "")}
              >
                <SelectTrigger id="pat-doctor">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc._id} value={doc._id}>
                      {doc.name} — {doc.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-xs text-destructive">{errors.doctorId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select
                defaultValue={watch("status")}
                onValueChange={(v) => setValue("status", (v ?? "admitted") as PatientForm["status"])}
              >
                <SelectTrigger id="pat-status">
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
              <label className="text-sm font-medium" htmlFor="pat-blood">Blood Group</label>
              <Input id="pat-blood" placeholder="A+" {...register("bloodGroup")} />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="pat-notes">Notes</label>
              <textarea
                id="pat-notes"
                placeholder="Clinical notes..."
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
              id="add-patient-submit-btn"
              disabled={isLoading}
              style={{ background: "linear-gradient(135deg, oklch(0.62 0.16 160), oklch(0.52 0.18 220))" }}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Adding..." : "Add Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
