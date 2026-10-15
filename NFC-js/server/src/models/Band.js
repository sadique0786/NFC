import mongoose from 'mongoose';

const bandSchema = new mongoose.Schema(
  {
    bandId: { type: String, required: true, unique: true, trim: true }, // e.g. NF-4821
    nfcUid: { type: String, required: true, unique: true, trim: true }, // e.g. 04:A3:F1:9C
    holderName: { type: String, default: '', trim: true }, // student who owns it
    status: {
      type: String,
      enum: ['AVAILABLE', 'ACTIVE', 'BLOCKED'],
      default: 'AVAILABLE',
    },
  },
  { timestamps: true }
);

export const Band = mongoose.models.Band ?? mongoose.model('Band', bandSchema);
