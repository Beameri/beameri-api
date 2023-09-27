import { Campaign } from "./campaignModel.js";
import cloudinary from "cloudinary";

export const CreateCampaign = async (req, res) => {
  try {
    const { campaignType, campaignName, language, recipients } = req.body;
    // console.log(recipients);
    // console.log(req.body);

    // Check if a campaign with the same name already exists
    const existingCampaign = await Campaign.findOne({ campaignName });
    if (existingCampaign) {
      return res
        .status(400)
        .json({ success: false, message: "Campaign already exists" });
    }

    // Upload the video to Cloudinary
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(
      req.files.videoTemplate.tempFilePath,
      {
        resource_type: "video",
        folder: "campaigns/video-template",
      }
    );

    // Create the campaign in MongoDB
    const campaign = await Campaign.create({
      campaignType,
      campaignName,
      language,
      videoTemplate: { cloudinaryURL: cloudinaryResponse.secure_url },
      recipients,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Campaign Added",
      campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const GetCampaign = async (req, res) => {
  try {
    if (!req?.user) return res.status(400).json({ message: "Please login !" });
    // console.log(req?.user);

    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    if (campaigns) {
      return res.status(200).json({
        success: true,
        campaigns,
        message: "Fetched All campaigns ",
      });
    } else {
      return res.status(404).json({
        success: true,

        message: "No campaigns till Now",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
