# Mistralody Architecture

## Overview

Mistralody is a Next.js App Router application with three primary UI zones:

- Left: Strudel code editing + event/vibe visualization
- Right: Chat and voice commands
- Bottom: Contextual command suggestions

Core state is managed client-side with Zustand (`lib/state/workspaceStore.ts`).

## Data Flow

1. User enters text (or records voice) in `ChatPane`.
2. Voice requests call `/api/transcribe` (Voxtral via Mistral audio transcription).
3. Text instruction calls `/api/agent-edit` (Mistral LLM-based routing + edit result).
4. Updated code is stored in the workspace store.
5. Visualizer pane renders event/vibe visuals from code/playback state.
6. Optional vocal flow:
   - `/api/lyrics` generates lyrics from `LyricTimingContext`
   - `/api/singing` generates audio from ElevenLabs
   - `/api/voice-sample` orchestrates both

## Key Modules

- UI composition: `components/workspace/SplitWorkspace.tsx`
- Strudel code pane: `components/strudel/StrudelEditorPane.tsx`
- Chat + voice input: `components/chat/ChatPane.tsx`, `components/chat/VoiceInput.tsx`
- Suggestions: `components/suggestions/SuggestionsPane.tsx`
- Usage/limits UI: `components/usage/UsageIndicator.tsx`
- AI clients: `lib/ai/mistralClient.ts`, `lib/ai/elevenLabsClient.ts`
- Timing extraction: `lib/lyrics/timingContext.ts`
- Usage tracking: `lib/usage/usageTracker.ts`

## Reliability and Error UX

- Each async operation has step-level status (`transcribe`, `agent-edit`, `lyrics`, `singing`).
- Chat UI displays loading hints and error messages.
- API endpoints return clear error payloads for retries/fallbacks.

## Licensing

Strudel packages are AGPL-3.0 licensed. If this app is distributed with Strudel functionality enabled, ensure AGPL obligations are satisfied (source availability and attribution).

