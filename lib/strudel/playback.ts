"use client";

let initPromise: Promise<{
  evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
  hush: () => void;
  samples: (samples: Record<string, string>, baseUrl: string) => Promise<unknown>;
}> | null = null;

async function getStrudel() {
  if (!initPromise) {
    initPromise = (async () => {
      const { initStrudel, evaluate, hush, samples } = await import(
        "@strudel/web"
      );
      await initStrudel({
        prebake: async () => {
          await samples("github:tidalcycles/dirt-samples");
        },
      });
      return { evaluate, hush, samples };
    })();
  }
  return initPromise;
}

export async function playStrudelCode(code: string): Promise<void> {
  const { evaluate } = await getStrudel();
  await evaluate(code, true);
}

export async function addVocalSample(
  sampleId: string,
  baseUrl: string,
): Promise<void> {
  const { samples } = await getStrudel();
  await samples({ vocal: sampleId }, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

export function stopStrudelPlayback(): void {
  getStrudel()
    .then(({ hush }) => {
      try {
        hush();
      } catch {
        // repl may not be ready
      }
    })
    .catch(() => {});
}
