"use client";

import {
  Group,
  Panel,
  Separator,
  useDefaultLayout,
} from "react-resizable-panels";
import { Drawer } from "vaul";
import { useEffect, useRef, useState } from "react";
import { getPaneLayoutStorage } from "@/lib/layout/paneStorage";
import { List } from "lucide-react";
import { UsageIndicator } from "@/components/usage/UsageIndicator";
import { StrudelEditorPane } from "@/components/strudel/StrudelEditorPane";
import { ChatPane } from "@/components/chat/ChatPane";
import { SuggestionsPane } from "@/components/suggestions/SuggestionsPane";
import { useWorkspaceStore } from "@/lib/state/workspaceStore";
import { getContextualSuggestions } from "@/lib/commands/suggestionEngine";

const MAIN_GROUP_ID = "workspace-main";
const TOP_GROUP_ID = "workspace-top";

function SuggestionsPaneContent() {
  return <SuggestionsPane />;
}

function DesktopLayoutPlaceholder() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-[200px] flex-1 lg:min-w-0">
          <StrudelEditorPane />
        </div>
        <div className="h-1 w-full shrink-0 bg-border lg:h-full lg:w-1" />
        <div className="min-h-[200px] flex-1 lg:min-w-0">
          <ChatPane />
        </div>
      </div>
      <div className="h-1 shrink-0 bg-border" />
      <div className="min-h-[120px] flex-1">
        <SuggestionsPaneContent />
      </div>
    </div>
  );
}

function DesktopLayoutResizable() {
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
      className="min-h-0 flex-1"
      defaultLayout={mainLayout.defaultLayout ?? { top: 75, suggestions: 25 }}
      onLayoutChanged={mainLayout.onLayoutChanged}
    >
      <Panel id="top" defaultSize={75} minSize={50}>
        <Group
          id={TOP_GROUP_ID}
          orientation="horizontal"
          className="h-full"
          defaultLayout={topLayout.defaultLayout ?? { editor: 50, chat: 50 }}
          onLayoutChanged={topLayout.onLayoutChanged}
        >
          <Panel id="editor" defaultSize={50} minSize={30}>
            <StrudelEditorPane />
          </Panel>
          <Separator id="top-sep" className="w-1 shrink-0 bg-border hover:opacity-80" />
          <Panel id="chat" defaultSize={50} minSize={35}>
            <ChatPane />
          </Panel>
        </Group>
      </Panel>
      <Separator id="main-sep" className="h-1 shrink-0 bg-border hover:opacity-80" />
      <Panel id="suggestions" defaultSize={40} minSize={15}>
        <SuggestionsPaneContent />
      </Panel>
    </Group>
  );
}

function DesktopLayout() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DesktopLayoutPlaceholder />;
  }

  return <DesktopLayoutResizable />;
}

function MobileSuggestionsDrawer() {
  const { code } = useWorkspaceStore();
  const [open, setOpen] = useState(false);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const scrollYRef = useRef(0);
  const suggestionCount = getContextualSuggestions({ code }).length;

  useEffect(() => {
    if (open) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      scrollYRef.current = window.scrollY;
    } else {
      if (lastFocusedRef.current) lastFocusedRef.current.focus();
      window.scrollTo({ top: scrollYRef.current });
    }
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="bottom">
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="fixed bottom-6 right-6 flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-background shadow-lg transition hover:opacity-90"
          aria-label="Open suggestions"
        >
          <List className="h-6 w-6" />
          <span className="text-xs font-medium">Tips</span>
          <span className="rounded-full bg-white/20 px-2 text-xs">{suggestionCount}</span>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="bg-black/40" />
        <Drawer.Content className="max-h-[70vh] rounded-t-xl border-t border-border bg-background">
          <Drawer.Handle className="mx-auto mt-2 h-1 w-12 rounded-full bg-border" />
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
        <StrudelEditorPane />
      </div>
      <div className="min-h-[200px]">
        <ChatPane />
      </div>
      <MobileSuggestionsDrawer />
    </div>
  );
}

export function SplitWorkspace() {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3">
      <UsageIndicator />
      <div className="hidden min-h-[420px] flex-1 lg:flex lg:flex-col">
        <DesktopLayout />
      </div>
      <StackedLayout />
    </section>
  );
}
