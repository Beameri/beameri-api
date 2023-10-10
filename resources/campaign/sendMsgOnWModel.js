import mongoose from "mongoose";

const sendOnWhatsappModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    mobilenumber: {
      type: String,
      required: [true, "Mobile number required to send message"],
    },
    messageSid: {
      type: String,
      required: [true, "Message Sid  required "],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const WhatsappModel = mongoose.model(
  "WhatsappModel",
  sendOnWhatsappModel
);
