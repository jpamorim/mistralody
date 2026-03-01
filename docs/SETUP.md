# Setup Guide

## Prerequisites

- **Node.js 20+** (18+ may work)
- **npm 10+**
- API keys:
  - [Mistral](https://console.mistral.ai/) – for agent edits and Voxtral transcription
  - [ElevenLabs](https://elevenlabs.io/) – for singing synthesis

## Environment variables

Create `.env` (or copy from `.env.example`):

```bash
MISTRAL_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=             # optional; overrides default singing voice (Rachel)
NEXT_PUBLIC_APP_NAME=Mistralody
```

Keys and voice ID can also be configured in **Settings** (`/settings`); those values override env for the current session.

## Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Settings

At `/settings` you can:

- Configure Mistral and ElevenLabs API keys (stored server-side for the session)
- Set ElevenLabs voice ID (optional)
- Adjust per-service usage limits (stored in browser)

## Validation checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Text command updates code via `/api/agent-edit`
- [ ] Voice recording transcribes via `/api/transcribe`
- [ ] Lyrics generation via `/api/lyrics`
- [ ] Singing synthesis via `/api/singing`
- [ ] Voice sample flow via `/api/voice-sample`

## Troubleshooting

### ElevenLabs “unusual activity” error

ElevenLabs may block requests from datacenter IPs, VPNs, or proxies. Try:

- Run locally without VPN
- Use a different network (e.g. home Wi‑Fi vs corporate)
- Contact ElevenLabs support if you have a paid plan and still see this

### Invalid model response shape

The agent sometimes returns non-standard JSON. The app normalizes common variations (e.g. `code` vs `codePatch`, markdown wrapping). If issues persist, the error message includes validation details to help debug.

### Voice transcription fails

- Ensure recordings are at least 2 seconds
- Check that the blob size is large enough (min 4 KB)
- Verify Voxtral usage limits in settings
