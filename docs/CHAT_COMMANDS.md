# Chat Commands for Strudel Music Editing

This document defines the user-facing commands for a chat bot that edits live Strudel code safely and deterministically.

## Command Shape

Primary grammar:

- `action + target + modifier`
- Examples:
  - "increase tempo by 20%"
  - "add light reverb"
  - "transpose melody up 2 semitones"

Resolution priority:

1. Exact transport/system commands (`play`, `stop`, `undo`)
2. Parameter commands (`tempo`, `gain`, `cutoff`, `room`)
3. Structure commands (layering, mute/solo, add/remove part)
4. Style commands (variation, alive, punchier)

## 1) Transport Commands

- `play` -> ensure pattern ends with `.play()`
- `stop` / `hush` -> replace with `hush()`
- `pause` -> map to transport state pause (host-level)
- `resume` -> host-level resume and ensure active pattern playback
- `restart` -> reset transport clock and play from start

## 2) Tempo and Timing Commands

- `set tempo to 1.2` -> `setcps(1.2)`
- `faster` -> increase current `setcps` by 10%
- `slower` -> decrease current `setcps` by 10%
- `double speed` -> apply `.fast(2)` to active pattern
- `half speed` -> apply `.slow(2)` to active pattern

Defaults and bounds:

- Default cps: `1.0`
- Valid cps range: `0.25` to `4.0`

## 3) Rhythm Commands

- `add hi-hats` -> update sample pattern to include `hh*4`
- `denser drums` -> increase rhythm density (e.g. `*2`)
- `add syncopation` -> insert rests and offsets (`~`, euclidean forms)
- `more variation` -> wrap with `.sometimes(...)`

## 4) Melody and Harmony Commands

- `change notes to c3 e3 g3` -> `note("c3 e3 g3")`
- `transpose up 2` -> `.add(2)`
- `transpose down 3` -> `.add(-3)`
- `use minor scale` -> `.scale("minor")`
- `add chord layer` -> use `stack(...)` with a harmonic layer

## 5) Sound Source Commands

- `use sawtooth` -> `.s("sawtooth")`
- `use square wave` -> `.s("square")`
- `switch to samples` -> `.s("bd sd hh")`
- `change instrument to piano` -> `.s("piano")`

## 6) FX and Dynamics Commands

- `add reverb` -> `.room(0.3)` (or increase existing)
- `increase cutoff` -> `.cutoff(2000)` (relative if present)
- `lower gain` -> `.gain(0.7)` (relative if present)
- `shorter notes` -> `.decay(0.1).sustain(0.0)`
- `softer attack` -> increase `.attack(...)`

Bounds:

- `gain`: `0.0` to `1.5`
- `room`: `0.0` to `1.0`
- `cutoff`: `50` to `12000`
- `attack`: `0.0` to `2.0`
- `decay`: `0.01` to `5.0`
- `sustain`: `0.0` to `1.0`

## 7) Arrangement Commands

- `mute drums` -> remove or disable drum layer in `stack(...)`
- `solo bass` -> keep only selected layer
- `add second layer` -> `stack(base, base.superimpose(add(.04)))`
- `remove top layer` -> drop last `stack(...)` entry

## 8) Randomization and Movement Commands

- `make it more alive` -> `.sometimes(...)` + low-depth modulation
- `add subtle randomness` -> use bounded `perlin`/`sine` modulation
- `wobble filter` -> `.cutoff(sine.slow(4).range(300, 4000))`

Rule: randomization must stay bounded and reversible.

## 9) Undo/Redo and Snapshots

- `undo` -> revert to previous code snapshot
- `redo` -> re-apply reverted snapshot
- `save this version` -> persist named snapshot
- `go to version 3` -> restore index-based snapshot

## 10) Explainability Commands

- `what changed?` -> natural language summary + diff
- `show code diff` -> unified diff against prior state
- `why did it sound different?` -> map code change to sonic effect

## Synonym Map

- `faster`, `speed up`, `more bpm` -> `tempo.up`
- `slower`, `calmer` -> `tempo.down`
- `more space`, `bigger room` -> `room.up`
- `punchier` -> `decay.down` + slight `gain.up`
- `brighter` -> `cutoff.up`
- `darker` -> `cutoff.down`
- `wetter` -> `room.up`
- `dryer` -> `room.down`

## Fallback Behavior

- If intent confidence is low, ask a clarifying question with two options.
- If request is out of bounds, clamp and explain the applied value.
- If user asks for unsupported operation, suggest nearest supported commands.

