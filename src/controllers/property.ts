import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { ICreatePropertyInput, IPropertyId, ISearchPropertyInput } from "../types/property";
import { Property } from "../models/property";
import { BadRequestError, ConflictError, NotFoundError } from "../errors";
import cloudinary from "../config/cloudinary";
import { extractPublicId } from "cloudinary-build-url";

class PropertyController {
    public async addProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const body = req.validated?.body as ICreatePropertyInput;
        const images = req.uploadedImages ?? [];

        const isLimited = await Property.countDocuments({ owner: userId });
        if (isLimited > 5) throw new ConflictError("You reach your limit of creation: '5 properties'");

        const data = await Property.create({ ...body, images, owner: userId });

        return res.status(201).json(ApiResponse.success(data));
    }

    public async getProperties(req: Request, res: Response) {
        const { title, location, price, type } = req.validated?.query as ISearchPropertyInput;

        const filter: Record<string, unknown> = {};

        if (title) filter.title = { $regex: title, $options: 'i' };
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (type) filter.type = type;
        if (price) filter.price = { $lte: price };

        const properties = await Property.find(filter).lean();

        return res.json(ApiResponse.success(properties));
    }

    public async updateProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;
        const newImages = req.uploadedImages ?? [];

        const property = await Property.findOne({ _id: propertyId, owner: userId });
        if (!property) throw new NotFoundError("This property is not found");

        const { existingImages: rawExisting, ...updateData } = req.body;
        const existingImages = rawExisting.filter(
            (img: string) => img && img.startsWith('http')
        );
        const removedImages = property.images.filter(
            (img: string) => !existingImages.includes(img)
        );

        const images = [...existingImages, ...newImages].filter(Boolean);

        if (images.length > 5) throw new BadRequestError("Maximum 5 images allowed");

        const updatedProperty = await Property.findOneAndUpdate(
            { _id: propertyId, owner: userId },
            { ...updateData, images, updatedAt: new Date() },
            { returnDocument: 'after' }
        );

        if (removedImages.length > 0) {
            const results = await Promise.allSettled(
                removedImages.map((img: string) => {
                    const publicId = extractPublicId(img);
                    return cloudinary.uploader.destroy(publicId);
                })
            );

            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to delete image ${removedImages[i]}:`, result.reason);
                }
            });
        }

        return res.status(200).json(ApiResponse.success(updatedProperty));
    }

    public async deleteProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const property = await Property.findOneAndDelete({ _id: propertyId, owner: userId });
        if (!property) throw new NotFoundError("This property is not found");

        if (property.images.length > 0) {
            const results = await Promise.allSettled(
                property.images.map((img: string) => {
                    const publicId = extractPublicId(img);
                    return cloudinary.uploader.destroy(publicId);
                })
            );

            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to delete image ${property.images[i]}:`, result.reason);
                }
            });
        }

        return res.status(200).json(ApiResponse.success(property));
    }

    public async getProperty(req: Request, res: Response) {
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findById(propertyId).lean();
        if (!propertyExists) throw new NotFoundError("This property is not found");

        return res.status(200).json(ApiResponse.success(propertyExists));
    }

    public async getMyProperties(req: Request, res: Response) {
        const userId = req.user!.id;

        const propertyExists = await Property.find({ owner: userId });

        return res.status(200).json(ApiResponse.success(propertyExists));
    }
}

export default PropertyController;