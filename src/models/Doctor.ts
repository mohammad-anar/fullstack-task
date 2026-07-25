import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  experience: number;
  qualification: string;
  bio: string;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, "Hospital is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    experience: {
      type: Number,
      default: 0,
      min: [0, "Experience cannot be negative"],
    },
    qualification: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient search and filtering
DoctorSchema.index({ name: "text", specialization: "text", hospital: "text" });
DoctorSchema.index({ specialization: 1 });
DoctorSchema.index({ hospital: 1 });
DoctorSchema.index({ status: 1 });
DoctorSchema.index({ createdAt: -1 });

const Doctor: Model<IDoctor> =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", DoctorSchema);

export default Doctor;
