# Strudel REPL – Technical Reference for Agents

> **Source:** [strudel.cc/technical-manual/repl](https://strudel.cc/technical-manual/repl), [project-start](https://strudel.cc/technical-manual/project-start/), [getting-started](https://strudel.cc/learn/getting-started/). Use this doc when implementing or integrating Strudel in the mistralody app.

---

## What Is Strudel?

Strudel is a web-based live coding environment implementing the **Tidal Cycles** algorithmic pattern language in JavaScript. It runs in the browser and makes sound without SuperCollider or SuperDirt. The **Strudel REPL** is the main UI for manipulating patterns while they play, with visual feedback and a CodeMirror-based editor.

---

## REPL Control Flow

1. **Events** – For each scheduling tick, generated `Events` (Haps) are triggered via their `onTrigger` method (output-specific).
2. **Scheduler** – Queries the active `Pattern` at regular intervals and produces `Events` for the next time span.
3. **User code** – Each edit is transpiled and evaluated into a `Pattern` instance.

---

## Transpilation & Evaluation

User code is transpiled to support mini-notation in double-quoted strings:

```javascript
// User writes:
note("c3 [e3 g3]*2")

// Transpiled to:
note(m('c3 [e3 g3]', 5))
```

Double-quoted strings are wrapped in `m()` (mini-notation). Single-quoted strings stay as-is.

---

## Mini-notation

Compact rhythm syntax, Tidal-style, parsed with peggy:

- `"c3 [e3 g3]*2"` → `seq(reify('c3'), seq(reify('e3'), reify('g3')).fast(2))`
- `*` = repeat, `[]` = sequence, `<>` = superimpose, etc.

Example patterns:

```javascript
s("bd sd")                    // Samples: kick, snare
note("c3 e3 g3")              // Notes
s("bd,[~ <sd!3 sd(3,4,2)>],hh*8")  // Drums with rests, variation
```

---

## Embedding in a Web Project (Next.js, etc.)

### License

Strudel is **AGPL-3.0**. Derivative work must be licensed compatibly; source must be distributed with web publication.

### Option 1: iframe (URL)

```html
<iframe src="https://strudel.cc/?xwWRfuCE8TAR" width="600" height="300"></iframe>
```

Or use the long URL from the address bar to encode code directly (no external DB dependency).

### Option 2: @strudel/embed (iframe + code)

```html
<script src="https://unpkg.com/@strudel/embed@latest"></script>
<strudel-repl>
  <!--
setcps(1)
n("<0 1 2 3 4>*8").scale('G4 minor')
.s("gm_lead_6_voice")
  -->
</strudel-repl>
```

Code goes inside HTML comments so it’s not interpreted as HTML.

### Option 3: @strudel/repl (direct, no iframe)

```html
<script src="https://unpkg.com/@strudel/repl@1.0.2"></script>
<strudel-editor>
  <!--
setcps(1)
n("<0 1 2 3 4>*8").scale('G4 minor')
.s("gm_lead_6_voice")
  -->
</strudel-editor>
```

- Component name is `<strudel-editor>`, not `strudel-repl`.
- Pin version (e.g. `@1.0.2`) for stability.

### Option 4: @strudel/web (custom UI)

```html
<script src="https://unpkg.com/@strudel/web@1.0.3"></script>
<button id="play">play</button>
<button id="stop">stop</button>
<script>
  initStrudel();
  document.getElementById('play').addEventListener('click', () => note('<c a f e>(3,8)').jux(rev).play());
  document.getElementById('stop').addEventListener('click', () => hush());
</script>
```

Use when you want your own UI instead of CodeMirror.

### Via npm

Strudel packages are under `@strudel/*`. Use a bundler that supports ES modules (e.g. Vite). See [Packages](https://strudel.cc/technical-manual/packages/).

---

## Control Parameters

Control parameters shape each event’s value:

```javascript
note('c3 e3')
  .cutoff(1000)
  .s('sawtooth')
  .queryArc(0, 1)
  .map((hap) => hap.value);
// → [{ note: 'c3', cutoff: 1000, s: 'sawtooth' }, { note: 'e3', ... }]
```

Common params: `note`, `cutoff`, `s` (synth/sample), `gain`, `decay`, `attack`, `sustain`, `room`, `speed`, etc.

Custom params:

```javascript
const { x, y } = createParams('x', 'y');
x(sine.range(0, 200)).y(cosine.range(0, 200));
```

---

## Scheduling & Output

- Scheduler queries `Pattern.queryArc(time, time + interval)`.
- Query interval ~50 ms, `minLatency` ~100 ms.
- Each event’s `onTrigger` is called by the output (e.g. Web Audio).

Default output is Web Audio. Outputs map event values to audio (oscillators, samples, effects).

---

## Useful Patterns & Functions

| Function   | Purpose                    |
|-----------|----------------------------|
| `s("bd sd")` | Play samples by name       |
| `note("c3 e3")` | Note patterns              |
| `setcps(1)` | Set cycles per second      |
| `hush()` | Stop all sound             |
| `.play()` | Start pattern              |
| `.slow(n)` | Slow pattern by factor n   |
| `.fast(n)` | Speed up by factor n       |
| `.jux(rev)` | Stereo effect              |
| `.room(n)` | Reverb                     |
| `.sometimes(f)` | Occasionally apply modifier |
| `.superimpose(f)` | Add extra layers            |
| `stack(...)` | Layer multiple patterns     |
| `sine`, `cosine`, `perlin` | Modulators for automation  |

---

## Vim Keybindings

See [strudel.cc/technical-manual/vim](https://strudel.cc/technical-manual/vim).

---

## Links

- [Strudel REPL](https://strudel.cc/)
- [Technical manual](https://strudel.cc/technical-manual/docs/)
- [Examples](https://strudel.cc/examples/)
- [Codeberg repo](https://codeberg.org/uzu/strudel/)
- [npm @strudel packages](https://www.npmjs.com/search?q=%40strudel)
