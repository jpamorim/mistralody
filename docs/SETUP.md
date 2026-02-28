# Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- API keys:
  - Mistral (`MISTRAL_API_KEY`)
  - ElevenLabs (`ELEVENLABS_API_KEY`)

## Environment Variables

Create/update `.env`:

```bash
MISTRAL_API_KEY=...
ELEVENLABS_API_KEY=...
NEXT_PUBLIC_APP_NAME=Mistralody
```

## Install and Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Settings and Limits

- Open `/settings` to configure API keys and usage limits.
- API keys entered there are stored server-side in this prototype runtime store.
- Usage limits are persisted in the browser and reflected in `UsageIndicator`.

## Validation Checklist

1. `npm run lint` passes
2. `npm run build` passes
3. Text command updates code through `/api/agent-edit`
4. Voice recording transcribes through `/api/transcribe`
5. Lyrics generation works through `/api/lyrics`
6. Singing generation works through `/api/singing`
7. Orchestration works through `/api/voice-sample`

## Notes

- Audio uploads are constrained to 10 MB and target short command clips.
- This implementation uses a safe, iterative fallback strategy for async failures (retryable API responses + preserved UI state).

