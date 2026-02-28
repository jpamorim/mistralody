"use client";

import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import { Drawer } from "vaul";
import { useState } from "react";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";
import { getPaneLayoutStorage } from "@/lib/layout/paneStorage";
import { List } from "lucide-react";

const MAIN_GROUP_ID = "workspace-main";
const TOP_GROUP_ID = "workspace-top";

function EditorPanePlaceholder() {
  const { code } = useWorkspaceStore();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background p-4">
      <h2 className="text-lg font-semibold">Strudel Editor</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Editor and visualization will be integrated in the next todo.
      </p>
      <pre className="mt-4 overflow-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
        {code}
      </pre>
    </div>
  );
}

function ChatPanePlaceholder() {
  const { inputMode, isPlaying } = useWorkspaceStore();

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background p-4">
      <h2 className="text-lg font-semibold">Chat + Voice</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Input mode: {inputMode} | Playback:{" "}
        {isPlaying ? "playing" : "stopped"}
      </p>
    </div>
  );
}

function SuggestionsPaneContent() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-background p-4">
      <h2 className="text-lg font-semibold">Suggestions</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Contextual command suggestions will be wired up in a later todo.
      </p>
    </div>
  );
}

function DesktopLayout() {
  const storage = getPaneLayoutStorage();

  const mainLayout = useDefaultLayout({
    id: MAIN_GROUP_ID,
    storage,
    panelIds: ["top", "suggestions"],
  });

  const topLayout = useDefaultLayout({
    id: TOP_GROUP_ID,
    storage,
    panelIds: ["editor", "chat"],
  });

  return (
    <Group
      id={MAIN_GROUP_ID}
      orientation="vertical"
      className="h-[calc(100vh-12rem)] min-h-[400px]"
      defaultLayout={mainLayout.defaultLayout ?? { top: 60, suggestions: 40 }}
      onLayoutChanged={mainLayout.onLayoutChanged}
    >
      <Panel id="top" defaultSize={60} minSize={30}>
        <Group
          id={TOP_GROUP_ID}
          orientation="horizontal"
          className="h-full"
          defaultLayout={topLayout.defaultLayout ?? { editor: 50, chat: 50 }}
          onLayoutChanged={topLayout.onLayoutChanged}
        >
          <Panel id="editor" defaultSize={50} minSize={25}>
            <EditorPanePlaceholder />
          </Panel>
          <Separator id="top-sep" className="w-1 shrink-0 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600" />
          <Panel id="chat" defaultSize={50} minSize={25}>
            <ChatPanePlaceholder />
          </Panel>
        </Group>
      </Panel>
      <Separator id="main-sep" className="h-1 shrink-0 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600" />
      <Panel id="suggestions" defaultSize={40} minSize={15}>
        <SuggestionsPaneContent />
      </Panel>
    </Group>
  );
}

function MobileSuggestionsDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="bottom">
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          aria-label="Open suggestions"
        >
          <List className="h-6 w-6" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-black/40" />
        <Drawer.Content className="max-h-[70vh] rounded-t-xl border-t bg-background">
          <Drawer.Handle className="mx-auto mt-2 h-1 w-12 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <div className="overflow-auto p-4">
            <SuggestionsPaneContent />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function StackedLayout() {
  return (
    <div className="flex flex-col gap-4 pb-24 lg:hidden">
      <div className="min-h-[200px]">
        <EditorPanePlaceholder />
      </div>
      <div className="min-h-[200px]">
        <ChatPanePlaceholder />
      </div>
      <MobileSuggestionsDrawer />
    </div>
  );
}

export function SplitWorkspace() {
  return (
    <section className="space-y-4">
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
      <StackedLayout />
    </section>
  );
}
