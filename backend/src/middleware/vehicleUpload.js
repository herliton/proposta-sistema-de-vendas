import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import multer from 'multer';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
export const vehicleUploadDirectory = path.join(currentDir, '..', '..', 'uploads', 'vehicles');
fs.mkdirSync(vehicleUploadDirectory, { recursive: true });

const allowedImages = new Set(['image/jpeg', 'image/png', 'image/webp']);
const allowedVideos = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, vehicleUploadDirectory),
  filename: (_req, file, callback) => {
    const extension = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov' })[file.mimetype] || '';
    callback(null, `${randomUUID()}${extension}`);
  },
});
export const vehicleUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const isVideo = req.params.kind === 'video';
    const valid = isVideo ? allowedVideos.has(file.mimetype) : allowedImages.has(file.mimetype);
    callback(valid ? null : new Error(isVideo ? 'Envie um vídeo MP4, WebM ou MOV.' : 'Envie uma imagem JPG, PNG ou WebP.'), valid);
  },
});

export const processVehicleUpload = (req, res, next) => vehicleUpload.single('file')(req, res, (error) => {
  if (!error) return next();
  const tooLarge = error.code === 'LIMIT_FILE_SIZE';
  return res.status(tooLarge ? 413 : 400).json({
    success: false, error: error.code || 'INVALID_MEDIA',
    message: tooLarge ? 'O arquivo excede o limite de 100 MB.' : error.message || 'Não foi possível receber o arquivo.',
  });
});
