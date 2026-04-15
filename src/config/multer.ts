import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }
});

export const uploadProperty = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});