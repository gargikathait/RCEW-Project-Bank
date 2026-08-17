import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export type FacultyValidationStatus = "pending" | "approved" | "disapproved";
export type ProjectFileType = "documentation" | "source" | "media";

export interface IProjectFile {
  _id?: Types.ObjectId;
  type: ProjectFileType;
  name: string;
  originalName: string;
  storageName: string;
  path: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IRating {
  userId: Types.ObjectId;
  rating: number;
  createdAt: Date;
}

export interface IProjectView {
  userId?: Types.ObjectId;
  sessionId?: string;
  viewedAt: Date;
}

export interface IProject {
  title: string;
  description: string;
  author: string;
  authorId: Types.ObjectId;
  department: string;
  year: string;
  category: string;
  level: string;
  tags: string[];
  features?: string;
  supervisor?: string;
  collaborators?: string;
  githubRepo?: string;
  deployLink?: string;
  githubId?: string;
  gmailId?: string;
  downloads: number;
  views: number;
  viewRecords: IProjectView[];
  rating: number;
  ratings: IRating[];
  files: IProjectFile[];
  facultyValidation: FacultyValidationStatus;
  facultyComments?: string;
  validatedBy?: Types.ObjectId;
  validatedAt?: Date;
  isPublished: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectMethods {
  calculateRating(): void;
}

export type ProjectDocument = HydratedDocument<IProject, IProjectMethods>;
type ProjectModel = Model<IProject, Record<string, never>, IProjectMethods>;

const ProjectFileSchema = new Schema<IProjectFile>(
  {
    type: { type: String, required: true, enum: ["documentation", "source", "media"], default: "documentation" },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    storageName: { type: String, required: true },
    path: { type: String, required: true, select: false },
    url: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ViewSchema = new Schema<IProjectView>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ProjectSchema = new Schema<IProject, ProjectModel, IProjectMethods>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    author: { type: String, required: true, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String, required: true, trim: true },
    year: { type: String, required: true, match: [/^\d{4}$/, "Year must be in YYYY format"] },
    category: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    features: { type: String, maxlength: 1000 },
    supervisor: { type: String, trim: true, maxlength: 100 },
    collaborators: { type: String, maxlength: 500 },
    githubRepo: { type: String, trim: true },
    deployLink: { type: String, trim: true },
    githubId: { type: String, trim: true },
    gmailId: { type: String, trim: true },
    downloads: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    viewRecords: [ViewSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratings: [RatingSchema],
    files: [ProjectFileSchema],
    facultyValidation: { type: String, enum: ["pending", "approved", "disapproved"], default: "pending", required: true },
    facultyComments: { type: String, maxlength: 1000 },
    validatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    validatedAt: { type: Date },
    isPublished: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Partial<IProject> & { _id?: Types.ObjectId; id?: string; __v?: number }) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

ProjectSchema.index({ authorId: 1 });
ProjectSchema.index({ department: 1, year: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ facultyValidation: 1 });
ProjectSchema.index({ title: "text", description: "text", tags: "text", author: "text" });

ProjectSchema.methods.calculateRating = function () {
  if (!this.ratings.length) {
    this.rating = 0;
    return;
  }
  const total = this.ratings.reduce((sum, item) => sum + item.rating, 0);
  this.rating = Math.round((total / this.ratings.length) * 10) / 10;
};

ProjectSchema.pre("save", function () {
  this.calculateRating();
  this.isApproved = this.facultyValidation === "approved";
});

export const Project =
  (mongoose.models.Project as ProjectModel | undefined) ?? mongoose.model<IProject, ProjectModel>("Project", ProjectSchema);
