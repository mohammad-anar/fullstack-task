import bcrypt from "bcryptjs";
import User from "@/models/User";

/**
 * Ensures a default admin account exists in MongoDB.
 * Creates the admin user if it does not exist yet.
 */
export async function seedAdmin(): Promise<boolean> {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@doctortracker.com").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "Dr. Admin",
        email: adminEmail,
        passwordHash,
        role: "admin",
      });
      console.log(`[SEED] Default admin user created successfully (${adminEmail})`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("[SEED] Failed to seed admin user:", error);
    return false;
  }
}
