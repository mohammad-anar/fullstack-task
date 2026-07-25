import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";

const specializations = [
  "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Dermatology",
  "Oncology", "Gastroenterology", "Psychiatry", "Endocrinology", "Nephrology",
  "Pulmonology", "Ophthalmology", "Urology", "Rheumatology", "Hematology",
];

const hospitals = [
  "City General Hospital", "Metro Medical Center", "St. Mary's Hospital",
  "Green Valley Clinic", "Sunrise Healthcare", "Central Medical Institute",
  "Royal Health Complex", "Unity Hospital",
];

const conditions = [
  "Hypertension", "Diabetes Type 2", "Cardiac Arrhythmia", "Asthma",
  "Appendicitis", "Pneumonia", "Migraine", "Fractured Femur", "Kidney Stones",
  "Anemia", "Thyroid Disorder", "COPD", "Stroke", "Gastritis", "Depression",
];

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const statuses = ["admitted", "discharged", "under-observation", "critical"];
const genders = ["male", "female", "other"];

const firstNames = ["James", "Maria", "David", "Sarah", "Michael", "Emily", "Robert", "Aisha", "William", "Fatima", "Ahmed", "Priya", "John", "Amara", "Carlos"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Wilson", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randName() {
  return `${rand(firstNames)} ${rand(lastNames)}`;
}

function randPhone() {
  return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
}

function randDate(daysBack: number) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
}

export async function POST() {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
    ]);

    // Create admin user
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );
    await User.create({
      name: "Dr. Admin",
      email: process.env.ADMIN_EMAIL || "admin@doctortracker.com",
      passwordHash,
      role: "admin",
    });

    // Create 15 doctors
    const doctorData = Array.from({ length: 15 }, (_, i) => {
      const name = randName();
      return {
        name: `Dr. ${name}`,
        specialization: specializations[i % specializations.length],
        hospital: rand(hospitals),
        phone: randPhone(),
        email: `dr.${name.toLowerCase().replace(" ", ".")}${i}@hospital.com`,
        experience: Math.floor(Math.random() * 25) + 1,
        qualification: rand(["MBBS", "MD", "MS", "FRCS", "FACC"]),
        bio: `Experienced ${specializations[i % specializations.length]} specialist with ${Math.floor(Math.random() * 25) + 1} years of practice.`,
        status: Math.random() > 0.1 ? "active" : "inactive",
      };
    });

    const doctors = await Doctor.insertMany(doctorData);

    // Create 60 patients
    const patientData = Array.from({ length: 60 }, () => {
      const name = randName();
      const doctor = rand(doctors);
      const admissionDate = randDate(90);
      return {
        name,
        age: Math.floor(Math.random() * 70) + 10,
        gender: rand(genders),
        condition: rand(conditions),
        phone: randPhone(),
        email: `${name.toLowerCase().replace(" ", ".")}${Math.floor(Math.random() * 999)}@email.com`,
        doctorId: doctor._id,
        admissionDate,
        status: rand(statuses),
        bloodGroup: rand(bloodGroups),
        notes: `Patient admitted for ${rand(conditions)}. Monitoring in progress.`,
        address: `${Math.floor(Math.random() * 999) + 1} Medical Ave, Healthcare City`,
      };
    });

    await Patient.insertMany(patientData);

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        users: 1,
        doctors: doctors.length,
        patients: patientData.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
