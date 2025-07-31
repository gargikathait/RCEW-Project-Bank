import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectFile {
  type: 'documentation' | 'source' | 'media';
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export interface IRating {
  userId: string;
  rating: number;
  createdAt: Date;
}

export interface IProject extends Document {
  _id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  department: string;
  year: string;
  category: string;
  level: string;
  tags: string[];
  features?: string;
  supervisor?: string;
  collaborators?: string;
  repositoryUrl?: string;
  downloads: number;
  views: number;
  rating: number;
  ratings: IRating[];
  files: IProjectFile[];
  isPublished: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  toJSON(): any;
}

const ProjectFileSchema = new Schema<IProjectFile>({
  type: {
    type: String,
    required: true,
    enum: ['documentation', 'source', 'media']
  },
  name: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const RatingSchema = new Schema<IRating>({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ProjectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required']
  },
  authorId: {
    type: String,
    required: [true, 'Author ID is required'],
    ref: 'User'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: {
      values: ['Computer Science Engineering', 'Information Technology', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'],
      message: 'Please select a valid department'
    }
  },
  year: {
    type: String,
    required: [true, 'Academic year is required'],
    match: [/^\d{4}$/, 'Year must be in YYYY format']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['web', 'mobile', 'iot', 'ai', 'robotics', 'data', 'security', 'hardware', 'other'],
      message: 'Please select a valid category'
    }
  },
  level: {
    type: String,
    required: [true, 'Academic level is required'],
    enum: {
      values: ['semester', 'minor', 'major', 'thesis', 'internship', 'research'],
      message: 'Please select a valid academic level'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  features: {
    type: String,
    maxlength: [1000, 'Features description cannot exceed 1000 characters']
  },
  supervisor: {
    type: String,
    trim: true,
    maxlength: [100, 'Supervisor name cannot exceed 100 characters']
  },
  collaborators: {
    type: String,
    maxlength: [500, 'Collaborators list cannot exceed 500 characters']
  },
  repositoryUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Repository URL must be a valid URL'
    }
  },
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratings: [RatingSchema],
  files: [ProjectFileSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
ProjectSchema.index({ authorId: 1 });
ProjectSchema.index({ department: 1, year: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ year: 1 });
ProjectSchema.index({ isPublished: 1, isApproved: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ downloads: -1 });
ProjectSchema.index({ rating: -1 });

// Text search index for title and description
ProjectSchema.index({ 
  title: 'text', 
  description: 'text', 
  tags: 'text',
  author: 'text'
});

// Calculate average rating when ratings are updated
ProjectSchema.methods.calculateRating = function() {
  if (this.ratings.length === 0) {
    this.rating = 0;
    return;
  }
  
  const totalRating = this.ratings.reduce((sum: number, rating: IRating) => sum + rating.rating, 0);
  this.rating = Math.round((totalRating / this.ratings.length) * 10) / 10;
};

// Pre-save middleware to calculate rating
ProjectSchema.pre('save', function(next) {
  if (this.isModified('ratings')) {
    this.calculateRating();
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
