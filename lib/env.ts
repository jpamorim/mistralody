import { z } from "zod";

const serverEnvSchema = z.object({
  MISTRAL_API_KEY: z.string().min(1, "MISTRAL_API_KEY is required"),
  ELEVENLABS_API_KEY: z.string().min(1, "ELEVENLABS_API_KEY is required"),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Mistralody"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

let serverEnvCache: ServerEnv | null = null;
let clientEnvCache: ClientEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (serverEnvCache) {
    return serverEnvCache;
  }

  const parsed = serverEnvSchema.safeParse({
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new Error(`Invalid server environment variables: ${issues}`);
  }

  serverEnvCache = parsed.data;
  return serverEnvCache;
}

export function getClientEnv(): ClientEnv {
  if (clientEnvCache) {
    return clientEnvCache;
  }

  clientEnvCache = clientEnvSchema.parse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  });

  return clientEnvCache;
}
