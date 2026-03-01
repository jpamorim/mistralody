/**
 * Injects a vocal sample layer into Strudel code.
 * Call addVocalSample() before evaluating - this only adds s("vocal") to the pattern.
 */
export function injectVocalLayer(code: string): string {
  // Add vocal layer: insert ", s(\"vocal\").gain(0.5).slow(2)" before ").play()"
  const withVocal = code.replace(
    /(\n\s*)\)\.play\(\)/,
    ',\n  s("vocal").gain(0.5).slow(2)\n).play()',
  );
  return withVocal;
}
