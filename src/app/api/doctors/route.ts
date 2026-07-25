import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const specialization = searchParams.get("specialization") || "";
    const hospital = searchParams.get("hospital") || "";
    const status = searchParams.get("status") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // Build filter query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { hospital: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (specialization) filter.specialization = { $regex: specialization, $options: "i" };
    if (hospital) filter.hospital = { $regex: hospital, $options: "i" };
    if (status) filter.status = status;

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;
    const [doctors, total] = await Promise.all([
      Doctor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Doctor.countDocuments(filter),
    ]);

    // Get patient counts per doctor
    const doctorIds = doctors.map((d) => d._id);
    const patientCounts = await Patient.aggregate([
      { $match: { doctorId: { $in: doctorIds } } },
      { $group: { _id: "$doctorId", count: { $sum: 1 } } },
    ]);

    const patientCountMap = new Map(
      patientCounts.map((pc) => [pc._id.toString(), pc.count])
    );

    const doctorsWithCounts = doctors.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
      patientCount: patientCountMap.get(doc._id.toString()) || 0,
    }));

    return NextResponse.json({
      doctors: doctorsWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, specialization, hospital, phone, email, experience, qualification, bio } = body;

    if (!name || !specialization || !hospital || !phone || !email) {
      return NextResponse.json(
        { error: "Name, specialization, hospital, phone, and email are required" },
        { status: 400 }
      );
    }

    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return NextResponse.json(
        { error: "A doctor with this email already exists" },
        { status: 409 }
      );
    }

    const doctor = await Doctor.create({
      name,
      specialization,
      hospital,
      phone,
      email,
      experience: experience || 0,
      qualification: qualification || "",
      bio: bio || "",
    });

    return NextResponse.json({ doctor, success: true }, { status: 201 });
  } catch (error) {
    console.error("Create doctor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
