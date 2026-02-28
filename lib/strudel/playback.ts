"use client";

let initPromise: Promise<{
  evaluate: (code: string, autoplay?: boolean) => Promise<unknown>;
  hush: () => void;
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
      return { evaluate, hush };
    })();
  }
  return initPromise;
}

export async function playStrudelCode(code: string): Promise<void> {
  const { evaluate } = await getStrudel();
  await evaluate(code, true);
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
