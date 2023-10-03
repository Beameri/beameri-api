import { Campaign } from "./campaignModel.js";
import cloudinary from "cloudinary";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

import transcribeAudio from "./transcribeAudio/TranscribeAudio.js";

const currentModulePath = dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIRECTORY = path.join(currentModulePath, "..", "..", "uploads");

const deleteFilesInDirectory = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    fs.unlinkSync(filePath);
  }
};

// merge videos api/campaign/merge
export const MergeVideo = async (req, res) => {
  // try {
  //   if (!req.files || !req.files.videos) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "Please upload atleast one video file.",
  //     });
  //   }
  //   if (!fs.existsSync(UPLOADS_DIRECTORY)) {
  //     fs.mkdirSync(UPLOADS_DIRECTORY, { recursive: true });
  //   }
  //   // console.log(UPLOADS_DIRECTORY);
  //   const uploadedVideos = req.files.videos;
  //   console.log(uploadedVideos);
  //   // Generate unique name for the merged video
  //   const uniqueName = Date.now().toString();
  //   const mp4FilePath = path.join(UPLOADS_DIRECTORY, `${uniqueName}.mp4`);
  //   // console.log("Merged MP4 File Path:", mp4FilePath);
  //   const fileNames = uploadedVideos.map((file) => {
  //     console.log(file.name);
  //     return path.join(UPLOADS_DIRECTORY, file.name);
  //   });
  //   console.log("Input File Names:", fileNames);
  //   // Create an array of promises for FFmpeg commands
  //   const ffmpegCommands = fileNames.map((fileName) => {
  //     return new Promise((resolve, reject) => {
  //       ffmpeg()
  //         .input(fileName)
  //         .on("error", (err) => {
  //           console.log("Error:", err);
  //           reject(err);
  //         })
  //         .on("end", () => {
  //           console.log("Video processed:", fileName);
  //           resolve();
  //         })
  //         .mergeToFile(mp4FilePath, UPLOADS_DIRECTORY);
  //     });
  //   });
  //   // Wait for all FFmpeg commands to finish
  //   await Promise.all(ffmpegCommands);
  //   // Upload the merged video to Cloudinary
  //   try {
  //     const cloudinaryResponse = await cloudinary.v2.uploader.upload(
  //       mp4FilePath,
  //       {
  //         resource_type: "video",
  //         folder: "campaigns/videos",
  //       }
  //     );
  //     if (!cloudinaryResponse) {
  //       console.log("Error uploading to Cloudinary");
  //       return res
  //         .status(500)
  //         .json({ message: "Error uploading to Cloudinary", success: false });
  //     }
  //     console.log(
  //       "Video uploaded to Cloudinary:",
  //       cloudinaryResponse.secure_url
  //     );
  //     // Delete the temporary merged video file
  //     fs.unlinkSync(mp4FilePath);
  //     // Respond with the Cloudinary URL
  //     return res.status(200).json({
  //       cloudinaryUrl: cloudinaryResponse.secure_url,
  //       success: true,
  //     });
  //   } catch (error) {
  //     console.log("Error uploading to Cloudinary:", error.message);
  //     // Delete the temporary merged video file in case of an error
  //     fs.unlinkSync(mp4FilePath);
  //     return res
  //       .status(500)
  //       .json({ message: "An error occurred", success: false });
  //   }
  // } catch (error) {
  //   console.log("error", error);
  //   return res.status(500).json({
  //     message: "An error occurred",
  //     success: false,
  //   });
  // }
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

    // Upload the video to Cloudinary
    // const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    //   req.files.videoTemplate.tempFilePath,
    //   {
    //     resource_type: "video",
    //     folder: "campaigns/video-template",
    //   }
    // );

    // // Create the campaign in MongoDB
    const campaign = await Campaign.create({
      campaignType,
      campaignName,
      language,
      // videoTemplate: { cloudinaryURL: cloudinaryResponse.secure_url },
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

// extract video to text /api/campaign/convert
export const VideoToText = async (req, res) => {
  try {
    if (!req.files || !req.files.videos) {
      return res
        .status(400)
        .json({ success: false, message: "No video files uploaded." });
    }

    if (!fs.existsSync(UPLOADS_DIRECTORY)) {
      fs.mkdirSync(UPLOADS_DIRECTORY, { recursive: true });
    }

    const videoFile = req.files.videoTemplate;

    const uniqueName = Date.now().toString();
    const mp4FilePath = path.join(UPLOADS_DIRECTORY, `${uniqueName}.mp4`);
    const mp3FilePath = path.join(UPLOADS_DIRECTORY, `${uniqueName}.mp3`);

    await videoFile.mv(mp4FilePath);

    ffmpeg()
      .input(mp4FilePath)
      .toFormat("mp3")
      .on("end", async () => {
        try {
          const transcription = await transcribeAudio(mp3FilePath);

          const cloudinaryResponse = await cloudinary.v2.uploader.upload(
            mp3FilePath,
            {
              resource_type: "audio",
              folder: "campaigns/audio-template",
            }
          );

          deleteFilesInDirectory(UPLOADS_DIRECTORY);
          console.log(transcription);

          return res.status(200).json({
            success: true,
            message: "Video converted to text successfully.",
            text: transcription,
            audio: cloudinaryResponse.secure_url,
          });
        } catch (error) {
          deleteFilesInDirectory(UPLOADS_DIRECTORY);
          console.log("Transcription Error:", error.message);
          return res.status(500).json({
            success: false,
            message: "Error with transcription: " + error.message,
          });
        }
      })
      .on("error", (err) => {
        console.log("err", err);
        return res.status(500).json({
          success: false,
          message: "Error converting video to text.",
          error: err.message ? err.message : "Something went wrong.",
        });
      })
      .save(mp3FilePath);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message ? error.message : "Something went wrong.",
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
