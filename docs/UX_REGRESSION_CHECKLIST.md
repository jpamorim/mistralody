# UX Regression Checklist

## Core flows

- [x] Text edit request: send text command, receive assistant response, code updates.
- [x] Voice transcription: record, transcribe, preview/auto-send, retry fallback available.
- [x] Suggestion click-to-send: tap suggestion, preview in chat input, send manually.
- [x] Voice sample generation: async status row supports long-running feedback and retry controls.
- [x] Settings limit update: validation, save feedback, test key actions, usage limit persistence.

## Responsive behavior

- [x] Desktop: resizable editor/chat/suggestions panes remain usable.
- [x] Mobile: stacked editor+chat layout with suggestions bottom drawer.
- [x] Mobile drawer discoverability: floating button includes label + badge count.
- [x] Chat keyboard handling: textarea focus scrolls into view for small screens.

## Validation runs

- [x] `npm run lint`
- [x] `npm run build`

