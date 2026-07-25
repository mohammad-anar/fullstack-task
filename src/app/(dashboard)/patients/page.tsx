"use client";

import { useState, useCallback } from "react";
import {
  useGetPatientsQuery,
  useDeletePatientMutation,
  useGetDoctorsQuery,
  Patient,
} from "@/store/services/apiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EditPatientDialog } from "@/components/patients/EditPatientDialog";
import { AddPatientDialog } from "@/components/doctors/AddPatientDialog";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  admitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  discharged: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "under-observation": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const GENDER_BADGE: Record<string, string> = {
  male: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  female: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  other: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [deletePatientMutation, { isLoading: isDeleting }] = useDeletePatientMutation();

  const { data, isLoading, isFetching } = useGetPatientsQuery({
    page,
    limit: 10,
    search,
    condition,
    status,
    gender,
    doctorId,
    dateFrom,
    dateTo,
  });

  const { data: doctorsData } = useGetDoctorsQuery({ limit: 100 });
  const doctors = doctorsData?.doctors ?? [];

  const patients = data?.patients ?? [];
  const pagination = data?.pagination;

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const applyFilters = () => setPage(1);
  const clearFilters = () => {
    setCondition("");
    setStatus("");
    setGender("");
    setDoctorId("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deletePatient) return;
    await deletePatientMutation(deletePatient._id);
    setDeletePatient(null);
  };

  const hasFilters = condition || status || gender || doctorId || dateFrom || dateTo;

  const getDoctorName = (doctorIdOrObj: string | { name: string }) => {
    if (typeof doctorIdOrObj === "object") return doctorIdOrObj.name;
    const doc = doctors.find((d) => d._id === doctorIdOrObj);
    return doc?.name ?? "—";
  };

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total ?? 0} registered patients
          </p>
        </div>
        <Button
          id="add-patient-page-btn"
          onClick={() => setAddOpen(true)}
          className="gap-2"
          style={{ background: "linear-gradient(135deg, oklch(0.62 0.16 160), oklch(0.52 0.18 220))" }}
        >
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="patient-search"
            placeholder="Search patients..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" id="patient-search-btn" onClick={handleSearch} className="h-9">
          Search
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              id="patient-filter-btn"
              className={cn("h-9 gap-2", hasFilters && "border-primary text-primary")}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "oklch(0.52 0.18 220)" }} />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 space-y-3">
            <p className="text-sm font-semibold">Filter Patients</p>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Condition</label>
              <Input
                id="filter-condition"
                placeholder="e.g. Hypertension"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
                <SelectTrigger id="filter-status" className="h-8 text-sm">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="under-observation">Under Observation</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Gender</label>
              <Select value={gender || "all"} onValueChange={(v) => setGender(v === "all" ? "" : v)}>
                <SelectTrigger id="filter-gender" className="h-8 text-sm">
                  <SelectValue placeholder="All genders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Doctor</label>
              <Select value={doctorId || "all"} onValueChange={(v) => setDoctorId(v === "all" ? "" : v)}>
                <SelectTrigger id="filter-doctor" className="h-8 text-sm">
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Admitted From</label>
                <Input
                  id="filter-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Admitted To</label>
                <Input
                  id="filter-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" id="patient-apply-filter-btn" className="flex-1" onClick={applyFilters}>Apply</Button>
              <Button size="sm" variant="outline" id="patient-clear-filter-btn" className="flex-1" onClick={clearFilters}>Clear</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      {isLoading || isFetching ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Users className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No patients found</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>Add First Patient</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Patient</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Age / Gender</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Condition</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Doctor</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Admitted</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow
                  key={patient._id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{patient.age}</span>
                      <Badge className={`text-xs ${GENDER_BADGE[patient.gender] ?? ""}`}>
                        {patient.gender}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {patient.condition}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {getDoctorName(patient.doctorId)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {format(new Date(patient.admissionDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STATUS_STYLES[patient.status] ?? ""}`}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          id={`patient-menu-${patient._id}`}
                          className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          id={`edit-patient-${patient._id}`}
                          onClick={() => setEditPatient(patient)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          id={`delete-patient-${patient._id}`}
                          onClick={() => setDeletePatient(patient)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              id="patient-prev-page-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              id="patient-next-page-btn"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddPatientDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        doctors={doctors}
      />

      <EditPatientDialog
        patient={editPatient}
        open={!!editPatient}
        onClose={() => setEditPatient(null)}
      />

      <Dialog open={!!deletePatient} onOpenChange={() => setDeletePatient(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deletePatient?.name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeletePatient(null)}>Cancel</Button>
            <Button
              variant="destructive"
              id="confirm-delete-patient-btn"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
