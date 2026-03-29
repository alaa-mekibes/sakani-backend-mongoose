import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { ICreatePropertyInput, IPropertyId, IUpdatePropertyInput } from "../types/property";
import { Property } from "../models/property";
import { NotFoundError } from "../errors";
import { Inquiry } from "../models/inquiry";
import { IInquiryId } from "../types/inquiry";
import { InquiryStatus } from "../types/app";

class PropertyController {
    public async addProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const body = req.validated?.body as ICreatePropertyInput;

        const data = await Property.create({ ...body, owner: userId });

        return res.status(201).json(ApiResponse.success(data));
    }

    public async updateProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const body = req.validated?.body as IUpdatePropertyInput;
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findOneAndUpdate({ _id: propertyId, owner: userId }, { ...body, updatedAt: new Date() }, { returnDocument: 'after' });
        if (!propertyExists) throw new NotFoundError("This property is not found");

        return res.status(200).json(ApiResponse.success(propertyExists));
    }

    public async deleteProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findOneAndDelete({ _id: propertyId, owner: userId });
        if (!propertyExists) throw new NotFoundError("This property is not found");

        return res.status(200).json(ApiResponse.success(propertyExists));
    }

    public async getProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findOne({ _id: propertyId, owner: userId });
        if (!propertyExists) throw new NotFoundError("This property is not found");

        return res.status(200).json(ApiResponse.success(propertyExists));
    }

    public async getMyProperties(req: Request, res: Response) {
        const userId = req.user!.id;

        const propertyExists = await Property.find({ owner: userId });

        return res.status(200).json(ApiResponse.success(propertyExists));
    }

    public async sendMessage(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findById(propertyId);
        if (!propertyExists) throw new NotFoundError("This property is not found");

        const data = await Inquiry.create({ buyer: userId, owner: propertyExists.owner._id });

        return res.status(200).json(ApiResponse.success(data));
    }

    public async markInquiryRead(req: Request, res: Response) {
        const userId = req.user!.id;
        const { inquiryId } = req.validated.params as IInquiryId;

        const inquiryExists = await Inquiry.findOneAndUpdate({ _id: inquiryId, owner: userId }, { status: InquiryStatus.read });
        if (!inquiryExists) throw new NotFoundError("This inquiry is not found");

        return res.status(200).json(ApiResponse.success(inquiryExists));
    }

    public async getInquiry(req: Request, res: Response) {
        const userId = req.user!.id;
        const { inquiryId } = req.validated.params as IInquiryId;

        const inquiryExists = await Inquiry.findOne({ _id: inquiryId, owner: userId });
        if (!inquiryExists) throw new NotFoundError("This inquiry is not found");

        return res.status(200).json(ApiResponse.success(inquiryExists));
    }

    public async getInquiries(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const data = await Inquiry.find({ owner: userId, property: propertyId });

        return res.status(200).json(ApiResponse.success(data));
    }
}

export default PropertyController;