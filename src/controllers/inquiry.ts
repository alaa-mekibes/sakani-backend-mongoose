import type { Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse";
import { IPropertyId } from "../types/property";
import { Property } from "../models/property";
import { ConflictError, NotFoundError } from "../errors";
import { Inquiry } from "../models/inquiry";
import { IInquiryId } from "../types/inquiry";
import { InquiryStatus } from "../types/app";

class InquiryController {

    //* For property buyer
    public async getInquiryPerProperty(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const inquiryExists = await Inquiry.findOne({ property: propertyId, buyer: userId });
        return res.status(200).json(ApiResponse.success(inquiryExists));
    }

    public async sendMessage(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const propertyExists = await Property.findById(propertyId);
        if (!propertyExists) throw new NotFoundError("This property is not found");

        const propertyIsMine = await Property.findOne({ _id: propertyId, owner: userId });
        if (propertyIsMine) throw new ConflictError("You can't inquire your properties");

        const alreadyInquired = await Inquiry.findOne({
            buyer: userId,
            property: propertyId
        });

        if (alreadyInquired) {
            throw new ConflictError("You have already inquired about this property");
        }

        const data = await Inquiry.create({ buyer: userId, owner: propertyExists.owner._id, property: propertyId });

        return res.status(200).json(ApiResponse.success(data));
    }

    public async deleteInquiry(req: Request, res: Response) {
        const userId = req.user!.id;
        const { inquiryId } = req.validated.params as IInquiryId;

        const inquiryExists = await Inquiry.findOneAndDelete({ _id: inquiryId, buyer: userId });
        if (!inquiryExists) throw new NotFoundError("This inquiry is not found");

        return res.status(200).json(ApiResponse.success(inquiryExists));
    }

    //* For property owner
    public async getInquiries(req: Request, res: Response) {
        const userId = req.user!.id;
        const { propertyId } = req.validated.params as IPropertyId;

        const data = await Inquiry.find({ owner: userId, property: propertyId });

        return res.status(200).json(ApiResponse.success(data));
    }

    public async getInquiry(req: Request, res: Response) {
        const userId = req.user!.id;
        const { inquiryId } = req.validated.params as IInquiryId;

        const inquiryExists = await Inquiry.findOne({ _id: inquiryId, owner: userId });
        if (!inquiryExists) throw new NotFoundError("This inquiry is not found");

        return res.status(200).json(ApiResponse.success(inquiryExists));
    }

    public async markInquiryRead(req: Request, res: Response) {
        const userId = req.user!.id;
        const { inquiryId } = req.validated.params as IInquiryId;

        const inquiryExists = await Inquiry.findOneAndUpdate({ _id: inquiryId, owner: userId }, { status: InquiryStatus.contacted });
        if (!inquiryExists) throw new NotFoundError("This inquiry is not found");

        return res.status(200).json(ApiResponse.success(inquiryExists));
    }


}

export default InquiryController;