"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useGetDoctorByIdQuery,
  useDeletePatientMutation,
  Doctor,
} from "@/store/services/apiService";
import { AddPatientDialog } from "./AddPatientDialog";
import {
  Phone,
  Mail,
  Building2,
  GraduationCap,
  Clock,
  UserPlus,
  Trash2,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  admitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  discharged: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "under-observation": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

interface DoctorDetailSheetProps {
  doctor: Doctor | null;
  open: boolean;
  onClose: () => void;
  allDoctors: Doctor[];
}

export function DoctorDetailSheet({
  doctor,
  open,
  onClose,
  allDoctors,
}: DoctorDetailSheetProps) {
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletePatient] = useDeletePatientMutation();

  const { data, isLoading, refetch } = useGetDoctorByIdQuery(doctor?._id ?? "", {
    skip: !doctor?._id,
  });

  const handleDeletePatient = async (patientId: string) => {
    setDeletingId(patientId);
    try {
      await deletePatient(patientId).unwrap();
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddPatientClose = () => {
    setAddPatientOpen(false);
    refetch();
  };

  if (!doctor) return null;

  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-[520px] overflow-y-auto p-0">
          {/* Hero section */}
          <div
            className="p-6 pb-5"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.18 220 / 0.1), oklch(0.62 0.16 160 / 0.08))",
            }}
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="sr-only">Doctor Details</SheetTitle>
            </SheetHeader>
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarFallback
                  className="text-lg font-bold text-white"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground truncate">{doctor.name}</h2>
                <p className="text-sm font-medium" style={{ color: "oklch(0.52 0.18 220)" }}>
                  {doctor.specialization}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge
                    className={doctor.status === "active"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground"}
                  >
                    {doctor.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {data?.patients?.length ?? doctor.patientCount ?? 0} patients
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Doctor Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contact & Info
              </h3>
              <div className="space-y-2.5">
                {[
                  { icon: Building2, label: doctor.hospital },
                  { icon: Phone, label: doctor.phone },
                  { icon: Mail, label: doctor.email },
                  { icon: GraduationCap, label: doctor.qualification || "—" },
                  { icon: Clock, label: `${doctor.experience} years experience` },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-foreground truncate">{label}</span>
                  </div>
                ))}
              </div>

              {doctor.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
                  {doctor.bio}
                </p>
              )}
            </div>

            <Separator />

            {/* Patients */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Assigned Patients ({data?.patients?.length ?? 0})
                </h3>
                <Button
                  size="sm"
                  id="sheet-add-patient-btn"
                  onClick={() => setAddPatientOpen(true)}
                  className="h-8 text-xs gap-1"
                  style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Patient
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : data?.patients?.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No patients assigned yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddPatientOpen(true)}
                    className="mt-1"
                  >
                    Add First Patient
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {data?.patients?.map((patient) => (
                    <div
                      key={patient._id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-border transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{patient.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {patient.condition} •{" "}
                          {format(new Date(patient.admissionDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge className={`text-xs shrink-0 ${STATUS_STYLES[patient.status] ?? ""}`}>
                        {patient.status}
                      </Badge>
                      <button
                        id={`delete-patient-${patient._id}-btn`}
                        onClick={() => handleDeletePatient(patient._id)}
                        disabled={deletingId === patient._id}
                        className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        aria-label="Delete patient"
                      >
                        {deletingId === patient._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AddPatientDialog
        open={addPatientOpen}
        onClose={handleAddPatientClose}
        doctors={allDoctors}
        preSelectedDoctorId={doctor._id}
      />
    </>
  );
}
