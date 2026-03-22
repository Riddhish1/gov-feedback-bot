import mongoose, { Document, Model, Schema } from "mongoose";

export type UserRole = "ADMIN" | "DISTRICT_HEAD" | "TALUKA_HEAD";

export interface IUser extends Document {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  assignedDistrict?: string;
  assignedTalukas?: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  inviteToken?: string;
  inviteExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "DISTRICT_HEAD", "TALUKA_HEAD"], required: true },
    assignedDistrict: { type: String, default: null },
    assignedTalukas: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    inviteToken: { type: String, default: null },
    inviteExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    lastLogin: { type: Date, default: null },
  },
  { collection: "users", timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ assignedDistrict: 1 });

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;
