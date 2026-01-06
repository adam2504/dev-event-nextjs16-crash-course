import mongoose, { Schema, Document, Model } from 'mongoose';
import Event from './event.model';

// Interface for the Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Booking schema definition
const bookingSchema = new Schema(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      validate: {
        validator: (id: mongoose.Types.ObjectId) => mongoose.Types.ObjectId.isValid(id),
        message: 'Invalid ObjectId format for eventId',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => emailRegex.test(email),
        message: 'Invalid email format',
      },
    },
  },
  {
    timestamps: true, // Enable automatic createdAt and updatedAt
  }
);

// Pre-save hook to verify referenced event exists
bookingSchema.pre('save', function() {
  const doc = this as IBooking;

  // Return a promise to make the hook async
  return Event.findById(doc.eventId).then(eventExists => {
    if (!eventExists) {
      throw new Error('Referenced event does not exist');
    }
  });
});

// Add index on eventId for faster queries
bookingSchema.index({ eventId: 1 });

// Booking model
const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;
