import ffmpeg from "fluent-ffmpeg";

export const validateMp3 = (mp3FilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(mp3FilePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        if (metadata.format && metadata.format.format_name === "mp3") {
          resolve(true);
        } else {
          reject(new Error("Invalid MP3 file."));
        }
      }
    });
  });
};
