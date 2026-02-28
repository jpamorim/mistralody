import { SplitWorkspace } from "@/components/workspace/SplitWorkspace";
import { getClientEnv } from "@/lib/env";
import Link from "next/link";
import { FirstRunGuide } from "@/components/onboarding/FirstRunGuide";

export default function Home() {
  const env = getClientEnv();

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-6">
      <header className="mx-auto mb-4 max-w-6xl md:mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{env.NEXT_PUBLIC_APP_NAME}</h1>
            <p className="text-sm text-zinc-500">
              Live-code music with Strudel, chat/voice controls, and AI editing.
            </p>
          </div>
          <Link
            href="/settings"
            className="rounded-md border px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Settings
          </Link>
        </div>
      </header>
      <FirstRunGuide />
      <div className="mx-auto flex min-h-0 min-w-0 flex-1 flex-col max-w-6xl">
        <SplitWorkspace />
      </div>
    </main>
  );
}
