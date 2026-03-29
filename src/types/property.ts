import type z from "zod";
import type { createPropertySchema, propertyIdSchema, updatePropertySchema } from "../schemas/property";

export type ICreatePropertyInput = z.infer<typeof createPropertySchema>;
export type IUpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type IPropertyId = z.infer<typeof propertyIdSchema>;
