import { Mistral } from "@mistralai/mistralai";
import { resolveMistralApiKey } from "@/lib/settings/resolvedKeys";

let mistralClient: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (mistralClient) {
    return mistralClient;
  }

  mistralClient = new Mistral({ apiKey: resolveMistralApiKey() });
  return mistralClient;
}
