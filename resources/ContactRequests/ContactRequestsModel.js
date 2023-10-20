import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ContactRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: [25, "name cannot exceed 25 characters"],
      required: [true, "Please Enter name "],
    },
    email: {
      type: String,
      required: [true, "Please Enter email "],
    },
    mobNumber: {
      type: String,
      required: [true, "Please Enter Mobile Number "],
    },
    message: {
      type: String,
      maxLength: [500, "message cannot exceed 500 characters"],
      required: [true, "Please Enter  message"],
    },
  },
  { timestamps: true, versionKey: false }
);

export const ContactRequest = mongoose.model(
  "ContactRequest",
  ContactRequestSchema
);
