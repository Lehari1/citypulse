const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Crime', 'Water', 'Electricity', 'Sanitation', 'Road & Traffic', 'Fire', 'Traffic', 'Pothole', 'Streetlight', 'Other'] 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: false }, // [lng, lat]
    address: { type: String, required: false }
  },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, default: 'open', enum: ['open', 'in progress', 'resolved'] },
  upvotes: { type: Number, default: 0 },
  upvotedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] },
  comments: [commentSchema]
});

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema); 