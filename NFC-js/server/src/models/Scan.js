import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    nfcUid: { type: String, required: true, trim: true },
    holderName: { type: String, default: '—' },
    action: { type: String, enum: ['ENTRY', 'EXIT'], default: 'ENTRY' },
    result: { type: String, enum: ['SUCCESS', 'DENIED', 'UNKNOWN'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

export const Scan = mongoose.models.Scan ?? mongoose.model('Scan', scanSchema);
