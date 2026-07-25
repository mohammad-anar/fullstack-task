import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const doctorId = searchParams.get("doctorId") || "";
    const condition = searchParams.get("condition") || "";
    const status = searchParams.get("status") || "";
    const gender = searchParams.get("gender") || "";
    const dateFrom = searchParams.get("dateFrom") || "";
    const dateTo = searchParams.get("dateTo") || "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { condition: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (doctorId) filter.doctorId = doctorId;
    if (condition) filter.condition = { $regex: condition, $options: "i" };
    if (status) filter.status = status;
    if (gender) filter.gender = gender;

    if (dateFrom || dateTo) {
      filter.admissionDate = {};
      if (dateFrom) filter.admissionDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.admissionDate.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;
    const [patients, total] = await Promise.all([
      Patient.find(filter)
        .populate("doctorId", "name specialization hospital")
        .sort({ admissionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Patient.countDocuments(filter),
    ]);

    const serialized = patients.map((p) => ({
      ...p,
      _id: p._id.toString(),
      doctorId: p.doctorId?.toString() || null,
    }));

    return NextResponse.json({
      patients: serialized,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get patients error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, age, gender, condition, phone, doctorId, admissionDate, status, bloodGroup, notes, address, email } = body;

    if (!name || !age || !gender || !condition || !phone || !doctorId) {
      return NextResponse.json(
        { error: "Name, age, gender, condition, phone and doctorId are required" },
        { status: 400 }
      );
    }

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const patient = await Patient.create({
      name,
      age,
      gender,
      condition,
      phone,
      email: email || "",
      doctorId,
      admissionDate: admissionDate || new Date(),
      status: status || "admitted",
      bloodGroup: bloodGroup || "",
      notes: notes || "",
      address: address || "",
    });

    return NextResponse.json({ patient, success: true }, { status: 201 });
  } catch (error) {
    console.error("Create patient error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
