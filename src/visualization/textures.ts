import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';

export function createGlyphTexture(glyph: string, color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const context = canvas.getContext('2d')!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '560px Georgia, serif';
  context.shadowColor = color;
  context.shadowBlur = 44;
  context.fillStyle = color;
  context.globalAlpha = 0.94;
  context.fillText(glyph, 256, 400);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  return texture;
}

export function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.12, 'rgba(255,248,224,.98)');
  gradient.addColorStop(0.38, 'rgba(237,218,178,.36)');
  gradient.addColorStop(1, 'rgba(237,218,178,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createRegionGlowTexture(color: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, `${color}24`);
  gradient.addColorStop(0.45, `${color}0f`);
  gradient.addColorStop(1, `${color}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createLabelTexture(label: string, subtitle?: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = subtitle ? 128 : 96;
  const context = canvas.getContext('2d')!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `${subtitle ? 22 : 26}px Arial, sans-serif`;
  context.letterSpacing = subtitle ? '3px' : '5px';
  context.fillStyle = '#ddd1b5';
  context.globalAlpha = subtitle ? 0.8 : 1;
  context.fillText(label.toUpperCase(), 256, subtitle ? 43 : 48);
  if (subtitle) {
    context.font = '500 14px Arial, sans-serif';
    context.letterSpacing = '3px';
    context.globalAlpha = 0.6;
    context.fillText(subtitle.toUpperCase(), 256, 82);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  return texture;
}

export function createStreakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const context = canvas.getContext('2d')!;
  const gradient = context.createLinearGradient(0, 0, 512, 0);
  gradient.addColorStop(0, 'rgba(235,220,185,0)');
  gradient.addColorStop(0.45, 'rgba(235,220,185,.025)');
  gradient.addColorStop(0.78, 'rgba(235,220,185,.16)');
  gradient.addColorStop(0.94, 'rgba(250,240,216,.88)');
  gradient.addColorStop(1, 'rgba(255,250,236,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 27, 512, 10);
  const head = context.createRadialGradient(478, 32, 0, 478, 32, 26);
  head.addColorStop(0, 'rgba(255,252,240,.95)');
  head.addColorStop(0.2, 'rgba(245,231,200,.5)');
  head.addColorStop(1, 'rgba(235,220,185,0)');
  context.fillStyle = head;
  context.fillRect(450, 4, 58, 56);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  return texture;
}
