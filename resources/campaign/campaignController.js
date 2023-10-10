import { Campaign } from "./campaignModel.js";
import cloudinary from "cloudinary";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
// twilio
import twilio from "twilio";

import { WhatsappModel } from "./sendMsgOnWModel.js";
import transcribeAudio from "./utils/TranscribeAudio.js";
import { validateMp3 } from "./utils/validateMp3.js";
import UploadAudioToElevenlabs from "./utils/UploadAudioToElevenlabs.js";

const currentModulePath = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIRECTORY = path.join(currentModulePath, "..", "..", "uploads");
const TEMP_DIRECTORY = path.join(currentModulePath, "..", "..", "temp");

// Create directories if they don't exist
const createDirectoryIfNotExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
};

createDirectoryIfNotExists(TEMP_DIRECTORY);
createDirectoryIfNotExists(UPLOADS_DIRECTORY);

// Helper function to delete files in a directory
const deleteFilesInDirectory = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    fs.unlinkSync(filePath);
  }
};

// Extract video to text /api/campaign/convert
export const VideoToText = async (req, res) => {
  try {
    const { videoTemplate } = req.files;

    if (!videoTemplate) {
      return res
        .status(400)
        .json({ success: false, message: "No video file uploaded." });
    }

    const generateUniqueFileName = () =>
      `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const mp4FilePath = path.join(
      UPLOADS_DIRECTORY,
      `${generateUniqueFileName()}.mp4`
    );
    const mp3FilePath = path.join(
      UPLOADS_DIRECTORY,
      `${generateUniqueFileName()}.mp3`
    );

    await videoTemplate.mv(mp4FilePath);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(mp4FilePath)
        .toFormat("mp3")
        .on("end", resolve)
        .on("error", reject)
        .save(mp3FilePath);
    });

    const isValidMp3 = await validateMp3(mp3FilePath);
    if (!isValidMp3) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid MP3 file." });
    }

    const addVoiceResponse = await UploadAudioToElevenlabs(mp3FilePath);

    if (addVoiceResponse.status === 422) {
      deleteFilesInDirectory(UPLOADS_DIRECTORY);

      return res.status(422).json({
        success: false,
        message: "Request failed with status code 422",
      });
    }

    console.log("voice sent to elevenlabs", addVoiceResponse.data.voice_id);

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(
      mp3FilePath,
      {
        resource_type: "video",
      }
    );

    const audioUrl = cloudinaryResponse.secure_url;
    console.log("audio sent to cloudinary");
    const transcription = await transcribeAudio(mp3FilePath);
    console.log("text extracted");

    // Create a campaign in MongoDB if needed
    // const campaign = await Campaign.create({
    //   audioTemplate: { cloudinaryURL: audioUrl },
    //   createdBy: req.user._id,
    // });

    deleteFilesInDirectory(UPLOADS_DIRECTORY);

    return res.status(200).json({
      success: true,
      message: "Video converted to text successfully.",
      text: transcription,
      audio: audioUrl,
      voiceId: addVoiceResponse.data.voice_id,
    });
  } catch (error) {
    deleteFilesInDirectory(UPLOADS_DIRECTORY);
    console.log("Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Merge videos /api/campaign/merge
export const MergeVideo = async (req, res) => {
  try {
    const { videos } = req.files;

    if (!videos || videos.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least two videos for merging.",
      });
    }

    const fileNames = [];
    const outputFilePath = path.join(
      TEMP_DIRECTORY,
      `${Date.now()}_output.mp4`
    );
    const ffmpegCommand = ffmpeg();

    videos.forEach((file) => {
      const tempPath = path.join(TEMP_DIRECTORY, file.name);
      fs.renameSync(file.tempFilePath, tempPath);
      fileNames.push(tempPath);
      ffmpegCommand.input(tempPath);
    });

    ffmpegCommand
      .on("error", (err) => {
        console.error("Error:", err);
        throw err;
      })
      .on("end", async () => {
        try {
          const videoResult = await cloudinary.v2.uploader.upload(
            outputFilePath,
            {
              resource_type: "video",
              folder: "campaigns/merge-video",
            }
          );

          if (!videoResult) {
            console.error("Error uploading to Cloudinary");
            throw new Error("Error uploading to Cloudinary");
          }

          res
            .status(200)
            .json({ success: true, cloudinaryUrl: videoResult.url });
        } catch (error) {
          console.error("Error uploading to Cloudinary:", error.message);
          throw error;
        } finally {
          deleteFilesInDirectory(TEMP_DIRECTORY);
          console.log("Files removed from the uploads folder");
        }
      });

    ffmpegCommand.mergeToFile(outputFilePath);
  } catch (error) {
    console.error("An error occurred:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create campaign /api/campaign/create
export const CreateCampaign = async (req, res) => {
  try {
    const { campaignType, campaignName, language, recipients } = req.body;

    const existingCampaign = await Campaign.findOne({ campaignName });
    if (existingCampaign) {
      return res
        .status(400)
        .json({ success: false, message: "Campaign already exists" });
    }

    // Create the campaign in MongoDB
    const campaign = await Campaign.create({
      campaignType,
      campaignName,
      language,
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
      message: error.message || "Something went wrong",
    });
  }
};

// Get all campaigns /api/campaign/getAll
export const GetCampaign = async (req, res) => {
  try {
    if (!req?.user) {
      return res.status(400).json({ message: "Please login!" });
    }

    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    if (campaigns.length > 0) {
      return res.status(200).json({
        success: true,
        campaigns,
        message: "Fetched all campaigns",
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "No campaigns found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const SendMsgOnWhatsapp = async (req, res) => {
  const { message, mobilenumber, name, createdBy } = req.body;

  // res.json({ fromnum, tonum });
  if (!mobilenumber) {
    return res.status(400).json({
      success: false,
      message: "Both fields are required",
    });
  }
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  // console.log(client);

  try {
    const response = await client.messages.create({
      from: "whatsapp:+14155238886",
      body: message,
      to: `whatsapp:+91${mobilenumber}`,
    });
    if (response) {
      const msgSentOnWhatsapp = await WhatsappModel.create({
        name,
        message,
        mobilenumber,
        messageSid: response.sid,
        createdBy,
      });
      if (msgSentOnWhatsapp) {
        return res
          .status(200)
          .json({ success: true, response, msgSentOnWhatsapp });
      }
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const GetMsgStatus = async (req, res) => {
  const { messageSid } = req.params;
  console.log(messageSid);
  const client = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  try {
    const message = await client.messages(messageSid).fetch();
    res.status(200).json({ status: message });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

export const GetAllWhatsappMsg = async (req, res) => {
  const { createdBy } = req.params;
  try {
    const response = await WhatsappModel.find({ createdBy: createdBy }).sort({
      createdAt: -1,
    });
    if (response) {
      return res.status(200).json({ success: true, response });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};
