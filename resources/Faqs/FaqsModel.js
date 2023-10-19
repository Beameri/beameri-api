import mongoose from "mongoose";

const FaqsSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    added_by: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Faqs = mongoose.model("FaqsSchema", FaqsSchema);

export default Faqs;
