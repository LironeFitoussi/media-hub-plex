import { z } from "zod";

export const createDownloadSchema = z.object({
    url: z.string().url("Must be a valid URL").refine(
        (url) => url.includes("1fichier.com"),
        { message: "URL must be a 1fichier.com link" }
    ),
});

export type CreateDownloadInput = z.infer<typeof createDownloadSchema>;

