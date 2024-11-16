import { z } from "zod";

export const errorFormat = z.object({
    message: z.string(),
    errors: z.array(z.string()),
});

export type ErrorFormat = z.infer<typeof errorFormat>;
