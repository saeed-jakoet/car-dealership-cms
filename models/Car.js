import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  mileage: { type: Number, required: true },
  year: { type: Number, required: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  images: [{ type: String }],
  features: [{ type: String }],
  location: { type: String, default: "Cape Town" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Car || mongoose.model('Car', carSchema);