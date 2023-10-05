import { Campaign } from "./campaignModel.js";
import cloudinary from "cloudinary";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import transcribeAudio from "./transcribeAudio/TranscribeAudio.js";
import { validateMp3 } from "./utils/validateMp3.js";

const currentModulePath = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIRECTORY = path.join(currentModulePath, "..", "..", "uploads");
const TEMP_DIRECTORY = path.join(currentModulePath, "..", "..", "temp");

const deleteFilesInDirectory = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    fs.unlinkSync(filePath);
  }
};

if (!fs.existsSync(TEMP_DIRECTORY)) {
  fs.mkdirSync(TEMP_DIRECTORY);
}

// extract video to text /api/campaign/convert
export const VideoToText = async (req, res) => {
  try {
    if (!req.files || !req.files.videoTemplate) {
      return res
        .status(400)
        .json({ success: false, message: "No video files uploaded." });
    }

    const videoFile = req.files.videoTemplate;
    const mp4FilePath = path.join(
      UPLOADS_DIRECTORY,
      `${Date.now()}_${Math.floor(Math.random() * 10000)}.mp4`
    );
    const mp3FilePath = path.join(
      UPLOADS_DIRECTORY,
      `${Date.now()}_${Math.floor(Math.random() * 10000)}.mp3`
    );

    await videoFile.mv(mp4FilePath);

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

    const cloudinaryResponse = await cloudinary.v2.uploader.upload(
      mp3FilePath,
      {
        resource_type: "video",
      }
    );

    const audioUrl = cloudinaryResponse.secure_url;

    const transcription = await transcribeAudio(mp3FilePath);

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
    });
  } catch (error) {
    deleteFilesInDirectory(UPLOADS_DIRECTORY);
    console.log("Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// merge videos api/campaign/merge
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
        console.log("Error:", err);
        throw err;
      })
      .on("end", async () => {
        // console.log("Videos merged successfully");

        try {
          const videoResult = await cloudinary.v2.uploader.upload(
            outputFilePath,
            {
              resource_type: "video",
              folder: "campaigns/merge-video",
            }
          );

          if (!videoResult) {
            console.log("Error uploading to Cloudinary");
            throw new Error("Error uploading to Cloudinary");
          } else {
            // console.log("Video uploaded to Cloudinary:", videoResult.url);
            res
              .status(200)
              .json({ success: false, cloudinaryUrl: videoResult.url });
          }
        } catch (error) {
          console.log("Error uploading to Cloudinary:", error.message);
          throw error;
        } finally {
          deleteFilesInDirectory(TEMP_DIRECTORY);
          console.log("Files removed from the uploads folder");
        }
      });

    ffmpegCommand.mergeToFile(outputFilePath);
  } catch (error) {
    console.log("An error occurred:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// create campaign api/campaign/create
export const CreateCampaign = async (req, res) => {
  try {
    const { campaignType, campaignName, language, recipients } = req.body;
    // console.log(req.body);

    const existingCampaign = await Campaign.findOne({ campaignName });
    if (existingCampaign) {
      return res
        .status(400)
        .json({ success: false, message: "Campaign already exists" });
    }

    // // Create the campaign in MongoDB
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
      message: error.message ? error.message : "Something went Wrong",
    });
  }
};

// get campaign api/campaign/getAll
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
