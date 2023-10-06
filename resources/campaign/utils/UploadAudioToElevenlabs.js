import path from "path";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export default async function (audioFilePath) {
  const audioFile = fs.createReadStream(audioFilePath);
  const name = path.basename(audioFilePath);

  const formData = new FormData();
  formData.append("files", audioFile);
  formData.append("name", name);

  const response = await axios.post(
    "https://api.elevenlabs.io/v1/voices/add",
    formData,
    {
      headers: {
        "xi-api-key": process.env.XI_API_KEY,
        Accept: "multipart/form-data",
        ...formData.getHeaders(),
      },
    }
  );

  return response;
}
