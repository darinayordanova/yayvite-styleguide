// Reads the token lists straight from the SCSS sources so the docs can never
// drift from the generated CSS.
import colorsScss from '../styles/tokens/_colors.scss?raw';
import spacingScss from '../styles/tokens/_spacing.scss?raw';
import typographyScss from '../styles/tokens/_typography.scss?raw';

export interface ColorToken {
  name: string;
  hex: string;
}

export const colors: ColorToken[] = [...colorsScss.matchAll(/'([\w-]+)':\s*(#[0-9a-f]{3,6})/gi)].map(
  ([, name, hex]) => ({ name, hex }),
);

const spaceBase = Number(/\$base:\s*(\d+)px/.exec(spacingScss)?.[1] ?? 4);

export const spaceSteps: Array<{ step: number; px: number }> = (
  /\$steps:\s*\(([^)]*)\)/.exec(spacingScss)?.[1] ?? ''
)
  .split(',')
  .map((s) => Number(s.trim()))
  .map((step) => ({ step, px: step * spaceBase }));

export interface TypeStyle {
  name: string;
  family: 'serif' | 'sans';
  size: string;
  lineHeight: string;
  weight: string;
  letterSpacing: string;
}

export const typeStyles: TypeStyle[] = [
  ...typographyScss.matchAll(/'([\w-]+)':\s*\((serif|sans),\s*([\d.]+px),\s*([\d.]+px),\s*(\d+),\s*([-\d.]+(?:px)?)\)/g),
].map(([, name, family, size, lineHeight, weight, letterSpacing]) => ({
  name,
  family: family as TypeStyle['family'],
  size,
  lineHeight,
  weight,
  letterSpacing,
}));

export const fontWeights: string[] = [
  ...(/\$weights:\s*\(([^)]*)\)/.exec(typographyScss)?.[1] ?? '').matchAll(/'([\w-]+)'/g),
].map(([, name]) => name);
