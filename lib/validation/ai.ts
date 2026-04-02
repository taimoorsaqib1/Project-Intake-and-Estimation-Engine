import { z } from "zod";

export const aiAnalysisSchema = z.object({
  features: z.array(z.string().min(1)),
  category: z.enum(["WEB_APP", "MOBILE", "AI_ML", "AUTOMATION", "INTEGRATION"]),
  effortMin: z.number().int().positive(),
  effortMax: z.number().int().positive(),
  techStack: z.array(z.string().min(1)),
  complexityScore: z.number().int().min(1).max(5),
});

export type AiAnalysis = z.infer<typeof aiAnalysisSchema>;
