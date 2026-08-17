import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "student" | "faculty" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rollNumber?: string;
  department?: string;
  semester?: string;
  year?: string;
  role: UserRole;
  profilePhoto?: string;
  githubId?: string;
  gmailId?: string;
  isActive: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    rollNumber: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    department: { type: String, trim: true },
    semester: { type: String, trim: true },
    year: { type: String, trim: true },
    role: { type: String, enum: ["student", "faculty", "admin"], default: "student", required: true },
    profilePhoto: { type: String },
    githubId: { type: String, trim: true },
    gmailId: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastActiveAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Partial<IUser> & { _id?: Types.ObjectId; id?: string; __v?: number }) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ rollNumber: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ lastActiveAt: -1 });

UserSchema.pre("validate", function () {
  if (!this.name) this.name = `${this.firstName ?? ""} ${this.lastName ?? ""}`.trim();
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User =
  (mongoose.models.User as UserModel | undefined) ?? mongoose.model<IUser, UserModel>("User", UserSchema);
