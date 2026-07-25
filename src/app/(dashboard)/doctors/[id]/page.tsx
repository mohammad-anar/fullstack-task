"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useGetDoctorByIdQuery,
  useDeleteDoctorMutation,
  useDeletePatientMutation,
  Patient,
} from "@/store/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { EditPatientDialog } from "@/components/patients/EditPatientDialog";
import { AddPatientDialog } from "@/components/doctors/AddPatientDialog";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Trash2,
  Edit,
  Eye,
  Stethoscope,
  Building2,
  Phone,
  Mail,
  Award,
  Clock,
  Calendar,
  Loader2,
  UserCheck,
  AlertCircle,
  FileText,
  MapPin,
  HeartPulse,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const PATIENT_STATUS_BADGE: Record<string, string> = {
  admitted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "under-observation": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-semibold animate-pulse",
  discharged: "bg-muted text-muted-foreground",
};

const DOCTOR_STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  inactive: "bg-muted text-muted-foreground",
};

function getInitials(name?: string | null) {
  if (!name || typeof name !== "string") return "DP";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "DP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return ((parts[0]?.[0] || "") + (parts[parts.length - 1]?.[0] || "")).toUpperCase() || "DP";
}

export default function DoctorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [doctorToDeleteOpen, setDoctorToDeleteOpen] = useState(false);

  const { data, isLoading, isError } = useGetDoctorByIdQuery(id);
  const [deletePatient, { isLoading: isDeletingPatient }] = useDeletePatientMutation();
  const [deleteDoctor, { isLoading: isDeletingDoctor }] = useDeleteDoctorMutation();

  const doctor = data?.doctor;
  const patients = data?.patients ?? [];

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.condition.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone.includes(search) ||
      patient.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeletePatientConfirm = async () => {
    if (!patientToDelete) return;
    await deletePatient(patientToDelete._id);
    setPatientToDelete(null);
  };

  const handleDeleteDoctorConfirm = async () => {
    if (!doctor) return;
    await deleteDoctor(doctor._id);
    router.push("/doctors");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading doctor details...</p>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Doctor Not Found</h2>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          The requested doctor profile could not be retrieved or has been removed.
        </p>
        <Link href="/doctors">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Doctors
          </Button>
        </Link>
      </div>
    );
  }

  const doctorInitials = getInitials(doctor.name);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Back button & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/doctors">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors List
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setAddPatientOpen(true)}
            className="gap-2"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
          >
            <UserPlus className="w-4 h-4" />
            Add Patient Under Doctor
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={() => setDoctorToDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete Doctor
          </Button>
        </div>
      </div>

      {/* Doctor Profile Banner Card */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 opacity-5 rounded-full pointer-events-none -mr-20 -mt-20"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <Avatar className="h-20 w-20 border-2 border-background shadow-md flex-shrink-0">
            <AvatarFallback
              className="text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
            >
              {doctorInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{doctor.name}</h1>
              <Badge className={cn("text-xs uppercase font-semibold", DOCTOR_STATUS_BADGE[doctor.status])}>
                {doctor.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span>{doctor.specialization}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{doctor.hospital}</span>
              </div>
              {doctor.qualification && (
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>{doctor.qualification}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{doctor.experience} Yrs Experience</span>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs text-muted-foreground pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {doctor.phone}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {doctor.email}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {format(new Date(doctor.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          <div className="bg-muted/40 border border-border/50 rounded-xl px-5 py-3 text-center min-w-[130px] flex-shrink-0">
            <p className="text-2xl font-bold text-primary">{patients.length}</p>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Assigned Patients</p>
          </div>
        </div>

        {doctor.bio && (
          <div className="mt-5 pt-4 border-t border-border/50">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Biography</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{doctor.bio}</p>
          </div>
        )}
      </div>

      {/* Assigned Patients Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Assigned Patients</h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredPatients.length} of {patients.length} total patient records
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patient or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Status Pill Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 text-xs rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="all">All Statuses</option>
              <option value="admitted">Admitted</option>
              <option value="under-observation">Under Observation</option>
              <option value="critical">Critical</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>
        </div>

        {filteredPatients.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-xl p-8 text-center space-y-3">
            <HeartPulse className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">No patients matching criteria</p>
            <Button size="sm" variant="outline" onClick={() => setAddPatientOpen(true)}>
              Add Patient
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden bg-card shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Patient Name</TableHead>
                  <TableHead className="font-semibold">Age / Gender</TableHead>
                  <TableHead className="font-semibold">Medical Condition</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold hidden md:table-cell">Contact</TableHead>
                  <TableHead className="font-semibold hidden lg:table-cell">Admission Date</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const patientInitials = getInitials(patient.name);
                  return (
                    <TableRow key={patient._id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            <AvatarFallback
                              className="text-xs font-bold text-white"
                              style={{ background: "linear-gradient(135deg, oklch(0.62 0.16 160), oklch(0.52 0.18 220))" }}
                            >
                              {patientInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm text-foreground">{patient.name}</p>
                            <p className="text-xs text-muted-foreground">{patient.email || "No email"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {patient.age} yrs • <span className="capitalize">{patient.gender}</span>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {patient.condition}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs font-medium capitalize", PATIENT_STATUS_BADGE[patient.status])}>
                          {patient.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {patient.phone}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {format(new Date(patient.admissionDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => setSelectedPatientForView(patient)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedPatientForEdit(patient)}
                            title="Edit Patient"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setPatientToDelete(patient)}
                            title="Delete Patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Patient Details Modal */}
      <Dialog open={!!selectedPatientForView} onOpenChange={() => setSelectedPatientForView(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              Patient Details
            </DialogTitle>
          </DialogHeader>

          {selectedPatientForView && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4 p-3 bg-muted/40 rounded-xl">
                <Avatar className="h-14 w-14 flex-shrink-0">
                  <AvatarFallback
                    className="text-base font-bold text-white"
                    style={{ background: "linear-gradient(135deg, oklch(0.62 0.16 160), oklch(0.52 0.18 220))" }}
                  >
                    {getInitials(selectedPatientForView.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-foreground text-base">{selectedPatientForView.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn("text-xs capitalize", PATIENT_STATUS_BADGE[selectedPatientForView.status])}>
                      {selectedPatientForView.status.replace("-", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {selectedPatientForView.age} yrs • <span className="capitalize">{selectedPatientForView.gender}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-primary" /> Medical Condition
                  </p>
                  <p className="font-semibold text-foreground">{selectedPatientForView.condition}</p>
                </div>

                <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-semibold text-foreground">{selectedPatientForView.bloodGroup || "N/A"}</p>
                </div>

                <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </p>
                  <p className="font-medium text-foreground">{selectedPatientForView.phone}</p>
                </div>

                <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </p>
                  <p className="font-medium text-foreground truncate">{selectedPatientForView.email || "N/A"}</p>
                </div>
              </div>

              <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1 text-sm">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Admission & Discharge
                </p>
                <p className="font-medium text-foreground">
                  Admitted: {format(new Date(selectedPatientForView.admissionDate), "MMMM d, yyyy")}
                </p>
                {selectedPatientForView.dischargeDate && (
                  <p className="font-medium text-muted-foreground text-xs mt-1">
                    Discharged: {format(new Date(selectedPatientForView.dischargeDate), "MMMM d, yyyy")}
                  </p>
                )}
              </div>

              {selectedPatientForView.address && (
                <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1 text-sm">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Address
                  </p>
                  <p className="font-medium text-foreground">{selectedPatientForView.address}</p>
                </div>
              )}

              {selectedPatientForView.notes && (
                <div className="p-3 bg-card border border-border/50 rounded-lg space-y-1 text-sm">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Clinical Notes
                  </p>
                  <p className="text-foreground/90 text-xs leading-relaxed">{selectedPatientForView.notes}</p>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setSelectedPatientForView(null)} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <EditPatientDialog
        patient={selectedPatientForEdit}
        open={!!selectedPatientForEdit}
        onClose={() => setSelectedPatientForEdit(null)}
      />

      {/* Add Patient Dialog */}
      <AddPatientDialog
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        doctors={doctor ? [doctor] : []}
        preSelectedDoctorId={id}
      />

      {/* Delete Patient Confirmation Modal */}
      <Dialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete patient{" "}
            <span className="font-semibold text-foreground">{patientToDelete?.name}</span>? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setPatientToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePatientConfirm}
              disabled={isDeletingPatient}
            >
              {isDeletingPatient && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Confirmation Modal */}
      <Dialog open={doctorToDeleteOpen} onOpenChange={setDoctorToDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{doctor.name}</span>? This will also remove all associated patients.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDoctorToDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDoctorConfirm}
              disabled={isDeletingDoctor}
            >
              {isDeletingDoctor && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
