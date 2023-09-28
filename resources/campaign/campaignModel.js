import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    campaignType: {
      type: String,
      enum: ["whatsapp", "rcs", "email"],
      required: [true, "Please specify the campaign type."],
    },
    campaignName: {
      type: String,
      required: [true, "Please enter a campaign name."],
    },
    language: {
      type: String,
      required: [true, "Please select a language."],
    },
    // videoTemplate: {
    //   cloudinaryURL: {
    //     type: String,
    //     required: [true, "Please upload a video template."],
    //   },
    // },
    recipients: [
      {
        name: {
          type: String,
          required: [true, "Please enter recipient's name."],
        },
        contact: {
          type: String,
          required: [true, "Please enter recipient's contact information."],
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Campaign = mongoose.model("Campaign", campaignSchema);
