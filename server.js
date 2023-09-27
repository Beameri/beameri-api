import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDatabase from "./database/db.js";
import cloudinary from "cloudinary";

// Connecting to database
connectDatabase();

//console.log(process.env.CLOUDINARY_API_KEY)
//cloudenary uses
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//<---------deployement------------->``
// const data_dir = path.resolve();

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(data_dir, "/frontend/build")));

//     app.get("*", (req, res) =>
//         res.sendFile(path.join(data_dir, "frontend", "build", "index.html"))
//     );
// } else {
app.get("/", (req, res) => {
  res.send("API is running..");
});
// }
//<---------deployement------------->
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejection
// process.on("unhandledRejection", (err) => {
//     console.log(`Error: ${err.message}`);
//     console.log(`Shutting down the server due to Unhandled Promise Rejection`);

//     server.close(() => {
//         process.exit(1);
//     });
// });
