import { Mistral } from "@mistralai/mistralai";
import { getServerEnv } from "@/lib/env";

let mistralClient: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (mistralClient) {
    return mistralClient;
  }

  const env = getServerEnv();
  mistralClient = new Mistral({ apiKey: env.MISTRAL_API_KEY });
  return mistralClient;
}
