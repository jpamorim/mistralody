import { SplitWorkspace } from "@/components/workspace/SplitWorkspace";
import { getClientEnv } from "@/lib/env";

export default function Home() {
  const env = getClientEnv();

  return (
    <main className="min-h-screen p-6">
      <header className="mx-auto mb-6 max-w-6xl">
        <h1 className="text-2xl font-semibold">{env.NEXT_PUBLIC_APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Next.js + TypeScript App Router bootstrap for Strudel agent workspace.
        </p>
      </header>
      <div className="mx-auto max-w-6xl">
        <SplitWorkspace />
      </div>
    </main>
  );
}
