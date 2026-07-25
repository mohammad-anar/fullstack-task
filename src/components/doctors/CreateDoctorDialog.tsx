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
import { useCreateDoctorMutation } from "@/store/services/apiService";
import { Loader2 } from "lucide-react";

const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  specialization: z.string().min(2, "Specialization is required"),
  hospital: z.string().min(2, "Hospital is required"),
  phone: z.string().min(7, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  experience: z.coerce.number().min(0).max(60).optional(),
  qualification: z.string().optional(),
  bio: z.string().max(500).optional(),
});

type DoctorForm = z.infer<typeof doctorSchema>;

interface CreateDoctorDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateDoctorDialog({ open, onClose }: CreateDoctorDialogProps) {
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: { experience: 0 },
  });

  const onSubmit = async (data: DoctorForm) => {
    try {
      setServerError("");
      await createDoctor(data).unwrap();
      reset();
      onClose();
    } catch (err: unknown) {
      const error = err as { data?: { error?: string } };
      setServerError(error?.data?.error || "Failed to create doctor");
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
          <DialogTitle className="text-lg font-semibold">Add New Doctor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-name">Full Name</label>
              <Input id="doc-name" placeholder="Dr. John Smith" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-spec">Specialization</label>
              <Input id="doc-spec" placeholder="Cardiology" {...register("specialization")} />
              {errors.specialization && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-hospital">Hospital</label>
              <Input id="doc-hospital" placeholder="City General Hospital" {...register("hospital")} />
              {errors.hospital && <p className="text-xs text-destructive">{errors.hospital.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-phone">Phone</label>
              <Input id="doc-phone" placeholder="+1234567890" {...register("phone")} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-email">Email</label>
              <Input id="doc-email" type="email" placeholder="doctor@hospital.com" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-exp">Experience (years)</label>
              <Input id="doc-exp" type="number" min={0} placeholder="5" {...register("experience")} />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-qual">Qualification</label>
              <Input id="doc-qual" placeholder="MBBS, MD" {...register("qualification")} />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium" htmlFor="doc-bio">Bio</label>
              <textarea
                id="doc-bio"
                placeholder="Brief professional biography..."
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                {...register("bio")}
              />
            </div>
          </div>

          {serverError && (
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{serverError}</p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              id="create-doctor-submit-btn"
              disabled={isLoading}
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isLoading ? "Creating..." : "Create Doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
