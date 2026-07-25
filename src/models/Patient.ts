import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  condition: string;
  phone: string;
  email: string;
  doctorId: mongoose.Types.ObjectId;
  admissionDate: Date;
  dischargeDate?: Date;
  status: "admitted" | "discharged" | "under-observation" | "critical";
  bloodGroup: string;
  notes: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["male", "female", "other"],
    },
    condition: {
      type: String,
      required: [true, "Medical condition is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
      match: [/^$|^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Assigned doctor is required"],
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
      default: Date.now,
    },
    dischargeDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["admitted", "discharged", "under-observation", "critical"],
      default: "admitted",
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient search and filtering
PatientSchema.index({ name: "text", condition: "text" });
PatientSchema.index({ doctorId: 1 });
PatientSchema.index({ status: 1 });
PatientSchema.index({ admissionDate: -1 });
PatientSchema.index({ condition: 1 });
PatientSchema.index({ gender: 1 });

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);

export default Patient;
