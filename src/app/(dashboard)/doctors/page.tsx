"use client";

import { useState, useCallback } from "react";
import { useGetDoctorsQuery, useDeleteDoctorMutation, Doctor } from "@/store/services/apiService";
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
import { CreateDoctorDialog } from "@/components/doctors/CreateDoctorDialog";
import { DoctorDetailSheet } from "@/components/doctors/DoctorDetailSheet";
import { AddPatientDialog } from "@/components/doctors/AddPatientDialog";
import {
  UserPlus,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Loader2,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  inactive: "bg-muted text-muted-foreground",
};

function DoctorCard({
  doctor,
  onView,
  onDelete,
  onAddPatient,
}: {
  doctor: Doctor;
  onView: () => void;
  onDelete: () => void;
  onAddPatient: () => void;
}) {
  const initials = doctor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      className="bg-card border border-border/50 rounded-xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={onView}
    >
      <div className="flex items-start justify-between mb-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback
            className="text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              id={`doctor-menu-${doctor._id}`}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem id={`view-doctor-${doctor._id}`} onClick={onView}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
            <DropdownMenuItem id={`add-patient-doctor-${doctor._id}`} onClick={onAddPatient}><UserPlus className="w-4 h-4 mr-2" />Add Patient</DropdownMenuItem>
            <DropdownMenuItem id={`delete-doctor-${doctor._id}`} onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <h3 className="font-semibold text-foreground text-sm leading-tight">{doctor.name}</h3>
      <p className="text-xs font-medium mt-0.5" style={{ color: "oklch(0.52 0.18 220)" }}>{doctor.specialization}</p>
      <p className="text-xs text-muted-foreground mt-1 truncate">{doctor.hospital}</p>
      <div className="flex items-center justify-between mt-3">
        <Badge className={`text-xs ${STATUS_BADGE[doctor.status]}`}>{doctor.status}</Badge>
        <span className="text-xs text-muted-foreground">{doctor.patientCount ?? 0} patients</span>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [deleteConfirmDoctor, setDeleteConfirmDoctor] = useState<Doctor | null>(null);
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  const { data, isLoading, isFetching } = useGetDoctorsQuery({
    page,
    limit: 10,
    search,
    specialization,
    dateFrom,
    dateTo,
  });

  const doctors = data?.doctors ?? [];
  const pagination = data?.pagination;

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSheetOpen(true);
  };

  const handleAddPatient = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAddPatientOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmDoctor) return;
    await deleteDoctor(deleteConfirmDoctor._id);
    setDeleteConfirmDoctor(null);
  };

  const applyFilters = () => {
    setPage(1);
  };

  const clearFilters = () => {
    setSpecialization("");
    setDateFrom("");
    setDateTo("");
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const hasFilters = specialization || dateFrom || dateTo;

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total ?? 0} registered practitioners
          </p>
        </div>
        <Button
          id="add-doctor-btn"
          onClick={() => setCreateOpen(true)}
          className="gap-2"
          style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
        >
          <Plus className="w-4 h-4" />
          Add Doctor
        </Button>
      </div>

      {/* Search & filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="doctor-search"
            placeholder="Search doctors..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" id="doctor-search-btn" onClick={handleSearch} className="h-9">
          Search
        </Button>

        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              id="doctor-filter-btn"
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
            <p className="text-sm font-semibold">Filter Doctors</p>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Specialization</label>
              <Input
                id="filter-spec"
                placeholder="e.g. Cardiology"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date From</label>
              <Input
                id="filter-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date To</label>
              <Input
                id="filter-date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button size="sm" id="apply-filter-btn" className="flex-1" onClick={applyFilters}>Apply</Button>
              <Button size="sm" variant="outline" id="clear-filter-btn" className="flex-1" onClick={clearFilters}>Clear</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden ml-auto">
          <button
            id="table-view-btn"
            onClick={() => setView("table")}
            className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors", view === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            id="grid-view-btn"
            onClick={() => setView("grid")}
            className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            Grid
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading || isFetching ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Stethoscope className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground font-medium">No doctors found</p>
          <Button size="sm" onClick={() => setCreateOpen(true)}>Add First Doctor</Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc._id}
              doctor={doc}
              onView={() => handleViewDoctor(doc)}
              onDelete={() => setDeleteConfirmDoctor(doc)}
              onAddPatient={() => handleAddPatient(doc)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Doctor</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Specialization</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Hospital</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Joined</TableHead>
                <TableHead className="font-semibold">Patients</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((doc) => {
                const initials = doc.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                return (
                  <TableRow
                    key={doc._id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleViewDoctor(doc)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback
                            className="text-xs font-bold text-white"
                            style={{ background: "linear-gradient(135deg, oklch(0.52 0.18 220), oklch(0.62 0.16 160))" }}
                          >
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{doc.specialization}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{doc.hospital}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {format(new Date(doc.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "oklch(0.52 0.18 220)" }}
                      >
                        {doc.patientCount ?? 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${STATUS_BADGE[doc.status]}`}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            id={`table-menu-${doc._id}`}
                            className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:bg-muted"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem id={`table-view-${doc._id}`} onClick={() => handleViewDoctor(doc)}><Eye className="w-4 h-4 mr-2" />View</DropdownMenuItem>
                          <DropdownMenuItem id={`table-add-patient-${doc._id}`} onClick={() => handleAddPatient(doc)}><UserPlus className="w-4 h-4 mr-2" />Add Patient</DropdownMenuItem>
                          <DropdownMenuItem id={`table-delete-${doc._id}`} onClick={() => setDeleteConfirmDoctor(doc)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
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
              id="prev-page-btn"
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
              id="next-page-btn"
              disabled={page >= (pagination.totalPages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs & Sheets */}
      <CreateDoctorDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <DoctorDetailSheet
        doctor={selectedDoctor}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        allDoctors={doctors}
      />

      <AddPatientDialog
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        doctors={doctors}
        preSelectedDoctorId={selectedDoctor?._id}
      />

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirmDoctor} onOpenChange={() => setDeleteConfirmDoctor(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{deleteConfirmDoctor?.name}</span>?
            This will also delete all associated patients.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirmDoctor(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              id="confirm-delete-doctor-btn"
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
