import { Readable } from 'stream';
import cloudinary from '../config/cloudinary';
import { NextFunction, Request, Response } from 'express';

export const uploadToCloudinary = (folder: 'properties' | 'avatars') => async (req: Request, _: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[] | undefined;
    const file = req.file as Express.Multer.File | undefined;

    const toUpload = files?.length ? files : file ? [file] : [];
    if (!toUpload.length) return next();

    try {
        const urls = await Promise.all(
            toUpload.map((f) =>
                new Promise<string>((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: `sakani/${folder}` },
                        (err, result) => err ? reject(err) : resolve(result!.secure_url)
                    );
                    Readable.from(f.buffer).pipe(stream);
                })
            )
        );

        req.uploadedImages = urls;
        next();
    } catch (err) {
        console.error('Cloudinary error:', err);
        next(new Error('upload image failed'));
    }
};