import multer, { Options } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const createStorage = (folder: "properties" | "avatars") => new CloudinaryStorage({
    cloudinary,
    params: {
        folder: `sakani/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, quality: 'auto' }],
    } as Options,
});

export const uploadProperty = multer({
    storage: createStorage('properties'),
    limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAvatar = multer({
    storage: createStorage('avatars'),
    limits: { fileSize: 2 * 1024 * 1024 },
});