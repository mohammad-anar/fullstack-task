import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const doctor = await Doctor.findById(id).lean();
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const patients = await Patient.find({ doctorId: id })
      .sort({ admissionDate: -1 })
      .lean();

    return NextResponse.json({
      doctor: { ...doctor, _id: doctor._id.toString() },
      patients: patients.map((p) => ({
        ...p,
        _id: p._id.toString(),
        doctorId: p.doctorId.toString(),
      })),
    });
  } catch (error) {
    console.error("Get doctor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean();

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor: { ...doctor, _id: doctor._id.toString() }, success: true });
  } catch (error) {
    console.error("Update doctor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Delete all patients assigned to this doctor
    await Patient.deleteMany({ doctorId: id });

    return NextResponse.json({ success: true, message: "Doctor and associated patients deleted" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
