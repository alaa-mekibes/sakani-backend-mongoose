import type z from "zod";
import type { createPropertySchema, propertyIdSchema, searchPropertySchema, updatePropertySchema } from "../schemas/property";

export type ICreatePropertyInput = z.infer<typeof createPropertySchema>;
export type IUpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type ISearchPropertyInput = z.infer<typeof searchPropertySchema>;
export type IPropertyId = z.infer<typeof propertyIdSchema>;
