# Mistralody Architecture

## Overview

Mistralody is a Next.js App Router app that connects natural language (text and voice) to live Strudel music code. The UI is organized into three main zones:

| Zone | Purpose |
|------|---------|
| **Left** | Strudel editor + event/vibe visualizer |
| **Right** | Chat pane with text and voice input |
| **Bottom** | Contextual command suggestions |

Core state lives in Zustand (`lib/state/workspaceStore.ts`).

## Data flow

1. User enters text or records voice in `ChatPane`.
2. **Voice** → `/api/transcribe` (Voxtral via Mistral) → transcribed text.
3. **Text** → `/api/agent-edit` (Mistral) → `intent` + `codePatch` (or `add_voice_sample`).
4. If `edit_code`: code is updated, playback restarts.
5. If `add_voice_sample`: `/api/voice-sample` orchestrates lyrics + ElevenLabs singing.
6. Visualizer pane reacts to playback state.

### Vocal flow (add_voice_sample)

```
/api/voice-sample
  ├─ /api/lyrics        (Mistral: lyric generation from timing context)
  └─ /api/singing       (ElevenLabs: text-to-speech)
  └─ /api/audio/vocal   (store audio)
  └─ addVocalSample() + injectVocalLayer()
```

## Key modules

| Module | Path | Role |
|--------|------|------|
| Split workspace | `components/workspace/SplitWorkspace.tsx` | Layout and panel composition |
| Strudel editor | `components/strudel/StrudelEditorPane.tsx` | Code editor + playback controls |
| Chat + voice | `components/chat/ChatPane.tsx`, `VoiceInput.tsx` | Input, agent flow, voice sample flow |
| Suggestions | `components/suggestions/SuggestionsPane.tsx` | One-click command chips |
| Usage indicator | `components/usage/UsageIndicator.tsx` | API usage and limits |
| AI clients | `lib/ai/mistralClient.ts`, `lib/ai/elevenLabsClient.ts` | Mistral, ElevenLabs |
| Timing context | `lib/lyrics/timingContext.ts` | BPM, bars, target syllables for lyrics |
| Vocal cache | `lib/audio/vocalCache.ts` | In-memory vocal sample registry |
| Inject vocal | `lib/strudel/injectVocal.ts` | Adds `s("vocal")` layer to patterns |

## Agent intent routing

The agent returns `intent`:

- `edit_code` → Apply `codePatch` to the pattern, restart playback.
- `add_voice_sample` → Run the ElevenLabs vocal flow (lyrics → singing → inject layer).

No hard-coded keyword detection; routing is driven by the agent.

## Error and UX behavior

- Async steps have status: `transcribe`, `agent-edit`, `lyrics`, `singing`.
- Chat shows loading hints and error messages.
- On playback failure, previous code is restored and playback resumes.
- API endpoints return structured error payloads for retries and fallbacks.

## Licensing

Strudel packages are AGPL-3.0. Ensure AGPL obligations are met when distributing this app with Strudel enabled.
