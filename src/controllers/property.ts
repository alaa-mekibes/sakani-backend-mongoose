import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { ICreatePropertyInput, IPropertyId, ISearchPropertyInput, IUpdatePropertyInput } from "../types/property";
import { Property } from "../models/property";
import { BadRequestError, NotFoundError } from "../errors";
import cloudinary from "../config/cloudinary";
import { extractPublicId } from "cloudinary-build-url";

class PropertyController {
    public async addProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const body = req.validated?.body as ICreatePropertyInput;
        const files = req.files as Express.Multer.File[];
        const images = files?.map(file => file.path) ?? [];

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
        const { existingImages, ...body } = req.validated?.body as IUpdatePropertyInput;
        const { propertyId } = req.validated.params as IPropertyId;
        const files = req.files as Express.Multer.File[];
        const newImages = files?.map(f => f.path) ?? [];

        const property = await Property.findOne({ _id: propertyId, owner: userId });
        if (!property) throw new NotFoundError("This property is not found");

        const removedImages = property.images.filter(
            (img: string) => !existingImages.includes(img)
        );

        await Promise.all(
            removedImages.map((img: string) => {
                const publicId = extractPublicId(img);
                return cloudinary.uploader.destroy(publicId);
            })
        );

        const images = [...existingImages, ...newImages];

        if (images.length > 5) throw new BadRequestError("Maximum 5 images allowed");

        const updatedProperty = await Property.findOneAndUpdate(
            { _id: propertyId, owner: userId },
            { ...body, images, updatedAt: new Date() },
            { returnDocument: 'after' }
        );

        return res.status(200).json(ApiResponse.success(updatedProperty));
    }

    public async deleteProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findOneAndDelete({ _id: propertyId, owner: userId });
        if (!propertyExists) throw new NotFoundError("This property is not found");

        return res.status(200).json(ApiResponse.success(propertyExists));
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