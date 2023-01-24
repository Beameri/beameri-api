import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import path from "path"
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Atp",
    },
});

// export const upload = multer({
//     storage: multer.diskStorage({}),
//     fileFilter: (req, file, cb) => {
//         let ext = path.extname(file.originalname);
//         //   if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
//         //   cb(new Error("File type is not supported"), false);
//         //   return;
//         // }
//         cb(null, true);
//     },
// });



export const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            cb(new Error("File type not supported!"), false)
            return
        }
        cb(null, true);
    }
});

export default cloudinary;