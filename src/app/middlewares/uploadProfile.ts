import path from "path";
import fs from "fs";
import multer from "multer";

const rootDir = path.join(process.cwd(), "uploads", "profile");
if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, rootDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    },
});

export const uploadProfile = multer({ storage });
