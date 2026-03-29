//*
export const PropertyType = {
    House: "house",
    Apartment: "apartment",
    Land: "land",
} as const;

export type PropertyType = typeof PropertyType[keyof typeof PropertyType];

//* 
export const InquiryStatus = {
    pending: "pending",
    read: "read",
} as const;

export type InquiryStatus = typeof InquiryStatus[keyof typeof InquiryStatus];