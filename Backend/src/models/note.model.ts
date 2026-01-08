import mongoose, { Schema } from "mongoose";

export interface NoteDocument extends mongoose.Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
}

const noteSchema = new Schema<NoteDocument>({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
},
{timestamps: true},
)

export const Note = mongoose.model<NoteDocument>("Note", noteSchema);