import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Simple slugify function to generate URL-friendly slugs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

// Event schema definition
const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description cannot be empty'],
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      minlength: [1, 'Overview cannot be empty'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      minlength: [1, 'Image cannot be empty'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      minlength: [1, 'Venue cannot be empty'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [1, 'Location cannot be empty'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
      minlength: [1, 'Date cannot be empty'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
      minlength: [1, 'Time cannot be empty'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
      trim: true,
      minlength: [1, 'Mode cannot be empty'],
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      minlength: [1, 'Audience cannot be empty'],
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (agenda: string[]) => agenda.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      minlength: [1, 'Organizer cannot be empty'],
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (tags: string[]) => tags.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    timestamps: true, // Enable automatic createdAt and updatedAt
  }
);

// Pre-save hook for slug generation, date normalization, and validation
eventSchema.pre('save', function() {
  const doc = this as IEvent;

  // Generate slug only if title is modified or new document
  if (doc.isModified('title') || doc.isNew) {
    doc.slug = slugify(doc.title);
  }

  // Normalize date to ISO format if modified
  if (doc.isModified('date')) {
    const dateObj = new Date(doc.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format');
    }
    doc.date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  // Normalize time to HH:MM format if modified
  if (doc.isModified('time')) {
    const timeRegex = /^(\d{1,2}):(\d{2})$/;
    const match = doc.time.match(timeRegex);
    if (!match) {
      throw new Error('Time must be in HH:MM format');
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time values');
    }
    doc.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
});

// Add unique index to slug
eventSchema.index({ slug: 1 });

// Event model
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);

export default Event;
