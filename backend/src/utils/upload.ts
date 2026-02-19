import path from "path";
import { randomUUID } from "crypto";
import multer from "multer";

const UPLOAD_DIR = path.resolve(__dirname, "../..", "public/uploads");

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename(_req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter(_req, file, cb) {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PNG and JPG images are allowed"));
        }
    },
});
