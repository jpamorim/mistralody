import { z } from "zod";

export const agentIntentSchema = z.object({
  intent: z.string().min(1),
  params: z.record(z.string(), z.unknown()).optional(),
  codePatch: z.string().optional(),
});

export type AgentIntent = z.infer<typeof agentIntentSchema>;
