import axios from "axios";
import fs from "fs";

export default async function transcribeAudio(mp3FilePath) {
  try {
    const response = await axios.post(
      "https://api.assemblyai.com/v2/upload",
      fs.readFileSync(mp3FilePath),
      {
        headers: {
          authorization: "460d8665699b4b52ada537d62282bbbb",
          "content-type": "application/octet-stream",
        },
      }
    );

    const { upload_url } = response.data;
    // console.log("response", response.data);

    const transcribeResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      {
        audio_url: upload_url,
      },
      {
        headers: {
          authorization: "460d8665699b4b52ada537d62282bbbb",
          "content-type": "application/json",
        },
      }
    );

    const { id: jobId } = transcribeResponse.data;
    console.log("transcribeResponse.data", transcribeResponse.data);

    let status = "queued";
    let transcription = "";

    while (status === "queued" || status === "processing") {
      const jobStatusResponse = await axios.get(
        `https://api.assemblyai.com/v2/transcript/${jobId}`,
        {
          headers: {
            authorization: "460d8665699b4b52ada537d62282bbbb",
          },
        }
      );

      status = jobStatusResponse.data.status;
      //   console.log("jobStatusResponse", jobStatusResponse.data);
      if (status === "completed") {
        transcription = jobStatusResponse.data.text;
        break;
      } else if (status === "failed") {
        console.log(
          "Transcription failed:",
          jobStatusResponse.data.error_message
        );
        throw new Error("Transcription failed");
      }

      // Wait for a few seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    // console.log("transcription", transcription);

    return transcription;
  } catch (error) {
    throw error;
  }
}
