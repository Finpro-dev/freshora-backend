import multer from "multer";

const storage = multer.memoryStorage();

// Filter --> image only
const fileFilter = (req: any, file: any, callback: any) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return callback(new Error("Only jpg, png, webp allowed"));
  }

  callback(null, true);
};

export const upload = multer({
  storage: storage,
  // limits: { fileSize: 2 * 1024 * 1024 }, // 2 mb max
  fileFilter: fileFilter,
});
