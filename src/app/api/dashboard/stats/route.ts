import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";

export async function GET() {
  try {
    await connectDB();

    const [
      totalDoctors,
      totalPatients,
      activePatients,
      criticalPatients,
      patientsByCondition,
      patientsByStatus,
      patientsByGender,
      admissionTrend,
      doctorWorkload,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Patient.countDocuments({ status: "admitted" }),
      Patient.countDocuments({ status: "critical" }),

      // Patients grouped by condition (top 6)
      Patient.aggregate([
        { $group: { _id: "$condition", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Patients by status
      Patient.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Patients by gender
      Patient.aggregate([
        { $group: { _id: "$gender", count: { $sum: 1 } } },
      ]),

      // Admission trend last 30 days
      Patient.aggregate([
        {
          $match: {
            admissionDate: {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$admissionDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Doctor workload (top 8)
      Patient.aggregate([
        { $group: { _id: "$doctorId", patientCount: { $sum: 1 } } },
        { $sort: { patientCount: -1 } },
        { $limit: 8 },
        {
          $lookup: {
            from: "doctors",
            localField: "_id",
            foreignField: "_id",
            as: "doctor",
          },
        },
        { $unwind: "$doctor" },
        {
          $project: {
            doctorName: "$doctor.name",
            specialization: "$doctor.specialization",
            patientCount: 1,
          },
        },
      ]),
    ]);

    const avgPatientsPerDoctor =
      totalDoctors > 0 ? (totalPatients / totalDoctors).toFixed(1) : 0;

    return NextResponse.json({
      stats: {
        totalDoctors,
        totalPatients,
        activePatients,
        criticalPatients,
        avgPatientsPerDoctor: Number(avgPatientsPerDoctor),
        dischargedPatients: totalPatients - activePatients,
      },
      charts: {
        patientsByCondition: patientsByCondition.map((c) => ({
          name: c._id,
          value: c.count,
        })),
        patientsByStatus: patientsByStatus.map((s) => ({
          name: s._id,
          value: s.count,
        })),
        patientsByGender: patientsByGender.map((g) => ({
          name: g._id,
          value: g.count,
        })),
        admissionTrend: admissionTrend.map((t) => ({
          date: t._id,
          admissions: t.count,
        })),
        doctorWorkload: doctorWorkload.map((d) => ({
          name: d.doctorName,
          specialization: d.specialization,
          patients: d.patientCount,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
