//This will contain details of all the tours

const mongoose = require("mongoose");

const itinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  title: String,
  description: String,
  mealPlan: {
    breakfast: Boolean,
    lunch: Boolean,
    dinner: Boolean
  },
  hotel: String,
  sightseeing: [String],
  transportation: [String],
  activities: [String],
}, { _id: false });

const featureSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String, 
}, { _id: false });

const photoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  caption: String,
}, { _id: false });

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String, 
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    }
  ],
  location: {
    type: String,
    required: true,
  },
  highlights: [
    {
      type: String,
    }
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  itinerary: [itinerarySchema],
  features: [featureSchema],
  photos: [photoSchema],
}, { timestamps: true });

module.exports = mongoose.model("Package", packageSchema);
