import { z } from "zod";

export const briefSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be at most 5000 characters"),
  budgetRange: z.enum(["UNDER_5K", "BETWEEN_5K_15K", "BETWEEN_15K_50K", "OVER_50K"], {
    required_error: "Please select a budget range",
  }),
  timelineUrgency: z.enum(
    ["ASAP", "ONE_TO_THREE_MONTHS", "THREE_TO_SIX_MONTHS", "SIX_PLUS_MONTHS"],
    { required_error: "Please select a timeline" }
  ),
  contactName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  contactEmail: z.string().email("Please enter a valid email address"),
});

export type BriefFormValues = z.infer<typeof briefSchema>;
