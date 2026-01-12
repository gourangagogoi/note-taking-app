import { z } from "zod";

export const createNoteSchema = z.object({
    title: z.string().min(1).max(100),
    content: z.string().min(1).max(5000)
});

export const updateNoteSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).max(5000).optional()
});

export const noteIdParamSchema = z.object({
    noteId: z.string().length(24)
})