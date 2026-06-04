# Galaxy Generator — Bauplan (vom Architekt, geprüft vom Agency Architekt 03.06.2026)

> Referenz für alle Bau-Phasen. Quelle: Architekt (deepseek-v4-pro). ✎ = Korrektur/Verbesserung durch Agency Architekt.
> verwandt: [[Projektverzeichnis]] · [[Prompt-Bibliothek]] · [[Sitzungs-Gedaechtnis]]

## Modul-/Dateistruktur
- `src/galaxy/random.js` — reiner seedbarer PRNG (mulberry32). Kein Three.js. Testbar.
- `src/galaxy/logic.js` — Herzstück: `generateGalaxy(options)`. Reine Mathematik, kein Three.js. Testbar.
- ✎ `src/galaxy/color.js` (oder in logic.js) — reine Helferfunktion `lerpColor(inner, outer, t)` für Farbverlauf. SEPARAT testbar (siehe Test-Fix).
- `src/galaxy/__tests__/logic.test.js` — Vitest-Tests für random, logic, color.
- `src/galaxy/renderer.js` — Three.js: BufferGeometry + PointsMaterial (runder Punkt via Canvas-Textur, kein Shader), Kamera, Resize, Animations-Loop.
- `src/main.js` — Einstieg: Szene init, `generateGalaxy()` aufrufen, Daten an Renderer, Loop starten.
- `src/style.css` — schwarzer Hintergrund, Canvas füllt Viewport.
- löschen: `src/counter.js`, `src/assets/*` (Vite-Boilerplate).

## Bau-Phasen (jede mit Prüf-Check)
- **P0 Aufräumen:** Boilerplate weg, leere schwarze Seite. → `npm run dev` ohne Fehler.
- **P1 Test-Würfel:** rotierender Würfel. → Three.js läuft sichtbar.
- **P2 PRNG `random.js` + Tests:** gleicher Seed → gleiche Folge. → Tests grün.
- **P3 `logic.js` + `color.js` + Tests:** `generateGalaxy()` fertig. → ≥7 Tests grün.
- **P4 Rendern (statisch):** Spiralmuster aus Punkten sichtbar.
- **P5 Interaktion:** Auto-Rotation + Maus-Parallax + Zoom (Mausrad). → geschmeidig.
- **P6 Feinschliff/Deploy:** Farben, responsive, `lil-gui`-Panel, `vite build`, live.

## Spezifikation `generateGalaxy(options)`
Parameter (alle optional, Defaults):
- `particleCount` 10000 · `radius` 15 · `arms` 4 · `spin` 0.5 · `spread` 0.3 · `heightSpread` 0.4
- `innerColor` {r:1,g:0.3,b:0.1} · `outerColor` {r:0.1,g:0.3,b:1} · `seed` undefined (Tests: fester Seed!)
- ✎ `concentration` 3 — verdichtet Partikel zum Zentrum: `distance = radius * prng()^concentration`. Großer Optik-Gewinn, bleibt im Radius (Test 3 gilt weiter). Default so, dass Mitte dichter wirkt.

Rückgabe: `{ positions: Float32Array(N*3), colors: Float32Array(N*3) }` — flach.

Algorithmus je Partikel i: armIndex = i % arms; distance (s.o.); angle = (distance/radius)*2π*spin + (armIndex/arms)*2π + (prng()-0.5)*spread; x=cos(angle)*distance, y=sin(angle)*distance, z=(prng()-0.5)*heightSpread*(1-distance/radius); Farbe = `lerpColor(innerColor, outerColor, distance/radius)`.

Randfälle: particleCount=0 → leere Arrays. arms=1 → eine Spirale. negativ radius/particleCount → Fehler werfen.

## Testfälle (fester Seed)
1. Längen: count 100 → positions.length 300, colors.length 300.
2. Null Partikel: count 0 → beide Länge 0.
3. Im Radius: alle sqrt(x²+y²+z²) ≤ radius + kleine Toleranz (✎ Toleranz ~0.5 wegen heightSpread, nicht 0.001).
4. Determinismus: gleicher Seed → identische Arrays (toEqual).
5. Verschiedene Seeds → unterschiedlich.
6. ✎ Ein Arm: count 50, arms 1 → kein Fehler, korrekte Länge. (Fuzzy „Winkelbereich"-Assertion streichen.)
7. ✎ Farbverlauf NICHT über Partikel-Index testen (Index ≠ Distanz!). Stattdessen `lerpColor` direkt: t=0 → innerColor, t=1 → outerColor, t=0.5 → Mittelwert.
8. Ungültige Eingabe: radius −5 oder count −10 → `.toThrow()`.

## Offene Optik-Idee (später)
Farbverlauf evtl. in HSL statt RGB (natürlicher). Erst nach erstem sichtbaren Ergebnis bewerten.
