import { OEPS, TYPE_REGIONS } from '../assessment/oeps';
import type { ResultProfile } from '../types';

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
};

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

export function downloadShareImage(profile: ResultProfile) {
  const canvas = document.createElement('canvas');
  canvas.width = 1800;
  canvas.height = 1800;
  const context = canvas.getContext('2d')!;
  const dominant = TYPE_REGIONS[profile.dominantTypes[0] - 1];
  const background = context.createRadialGradient(900, 800, 20, 900, 900, 1200);
  background.addColorStop(0, '#161711');
  background.addColorStop(0.55, '#0b0d09');
  background.addColorStop(1, '#050604');
  context.fillStyle = background;
  context.fillRect(0, 0, 1800, 1800);

  for (let index = 0; index < 340; index += 1) {
    const x = (index * 683) % 1771;
    const y = (index * 947) % 1753;
    const alpha = 0.03 + (index % 9) / 170;
    context.fillStyle = `rgba(235,223,190,${alpha})`;
    context.beginPath();
    context.arc(x, y, 0.5 + (index % 4) * 0.25, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = '#dbcfb4';
  context.font = '600 24px Arial, sans-serif';
  context.letterSpacing = '9px';
  context.fillText('N U E V E', 120, 130);
  context.fillStyle = 'rgba(235,225,202,.58)';
  context.font = '22px Arial, sans-serif';
  context.letterSpacing = '3px';
  context.fillText(profile.isDemo ? 'DEMONSTRATION CONSTELLATION' : 'PERSONALITY CONSTELLATION', 120, 182);

  const minX = -54;
  const maxX = 54;
  const mapX = (worldX: number) => 150 + ((worldX - minX) / (maxX - minX)) * 1500;
  const mapY = (worldY: number) => 880 - worldY * 32;
  TYPE_REGIONS.forEach((region) => {
    const score = profile.scores.find((item) => item.type === region.type)!;
    const x = mapX(region.position[0]);
    const y = mapY(region.position[1]);
    const glow = context.createRadialGradient(x, y, 0, x, y, 145);
    glow.addColorStop(0, `rgba(225,213,180,${0.04 + score.normalized * 0.11})`);
    glow.addColorStop(1, 'rgba(225,213,180,0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, 145, 0, Math.PI * 2);
    context.fill();
    context.font = '220px Georgia, serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = `rgba(231,219,190,${0.07 + score.normalized * 0.08})`;
    context.fillText(String(region.type), x, y);
  });

  profile.points.forEach((point) => {
    const x = mapX(point.home[0]);
    const y = mapY(point.home[1]);
    const radius = 3.5 + point.normalized * 6;
    const glow = context.createRadialGradient(x, y, 0, x, y, radius * 5);
    glow.addColorStop(0, `rgba(255,246,218,${0.78 + point.normalized * 0.2})`);
    glow.addColorStop(0.22, `rgba(232,213,172,${0.34 + point.normalized * 0.25})`);
    glow.addColorStop(1, 'rgba(232,213,172,0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(x, y, radius * 5, 0, Math.PI * 2);
    context.fill();
  });

  context.textAlign = 'left';
  context.textBaseline = 'alphabetic';
  context.letterSpacing = '0px';
  context.fillStyle = '#eee4cf';
  context.font = '54px Georgia, serif';
  context.fillText(`Type ${dominant.type} · ${dominant.name}`, 120, 1430);
  context.fillStyle = 'rgba(238,228,207,.68)';
  context.font = '29px Arial, sans-serif';
  const description = dominant.description;
  context.fillText(description.slice(0, 88), 120, 1490);
  if (description.length > 88) context.fillText(description.slice(88), 120, 1532);
  roundedRect(context, 120, 1590, 1560, 1, 1);
  context.fillStyle = 'rgba(226,212,178,.22)';
  context.fill();
  context.fillStyle = 'rgba(238,228,207,.48)';
  context.font = '20px Arial, sans-serif';
  context.fillText('OSPP OEPS v2 · education and self-reflection only · nueve', 120, 1654);
  context.textAlign = 'right';
  context.fillText(new Date(profile.createdAt).toLocaleDateString(), 1680, 1654);
  downloadDataUrl(canvas.toDataURL('image/png', 1), `nueve-type-${dominant.type}-constellation.png`);
}

export async function downloadReportPdf(profile: ResultProfile) {
  const { jsPDF } = await import('jspdf');
  const document = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const width = document.internal.pageSize.getWidth();
  const height = document.internal.pageSize.getHeight();
  const dominant = TYPE_REGIONS[profile.dominantTypes[0] - 1];
  const paintPage = () => {
    document.setFillColor(8, 10, 7);
    document.rect(0, 0, width, height, 'F');
    document.setDrawColor(65, 62, 51);
    document.line(48, 72, width - 48, 72);
    document.setTextColor(194, 181, 149);
    document.setFont('helvetica', 'bold');
    document.setFontSize(9);
    document.text('N U E V E  /  REFLECTION REPORT', 48, 50);
  };
  paintPage();
  document.setTextColor(239, 230, 209);
  document.setFont('times', 'normal');
  document.setFontSize(34);
  document.text(`Type ${dominant.type}`, 48, 145);
  document.setFontSize(22);
  document.text(dominant.name, 48, 178);
  document.setFont('helvetica', 'normal');
  document.setFontSize(11);
  document.setTextColor(177, 170, 151);
  document.text(document.splitTextToSize(dominant.description, width - 96), 48, 218, { lineHeightFactor: 1.55 });
  document.setTextColor(220, 207, 178);
  document.setFontSize(10);
  document.text(dominant.premise, 48, 284);
  document.text(dominant.fear, 48, 304);

  document.setFont('helvetica', 'bold');
  document.setTextColor(194, 181, 149);
  document.text('ALL NINE SIGNALS', 48, 362);
  const ordered = [...profile.scores].sort((a, b) => b.normalized - a.normalized);
  ordered.forEach((score, index) => {
    const region = TYPE_REGIONS[score.type - 1];
    const y = 396 + index * 38;
    document.setFont('helvetica', 'normal');
    document.setTextColor(225, 218, 200);
    document.setFontSize(11);
    document.text(`${score.type}  ${region.shortName}`, 48, y);
    document.setFillColor(35, 37, 30);
    document.roundedRect(200, y - 8, 282, 5, 2.5, 2.5, 'F');
    document.setFillColor(194, 181, 149);
    document.roundedRect(200, y - 8, 282 * score.normalized, 5, 2.5, 2.5, 'F');
    document.setTextColor(194, 181, 149);
    document.text(`${Math.round(score.normalized * 100)}%`, width - 48, y, { align: 'right' });
  });

  document.addPage();
  paintPage();
  document.setTextColor(239, 230, 209);
  document.setFont('times', 'normal');
  document.setFontSize(27);
  document.text('How to read this result', 48, 132);
  document.setTextColor(177, 170, 151);
  document.setFont('helvetica', 'normal');
  document.setFontSize(11);
  const paragraphs = [
    'The Open Enneagram of Personality Scales estimates which of nine commonly described Enneagram types your responses most closely resemble. A high score is an invitation to investigate, not a diagnosis or a definitive identity.',
    'Scores are additive. For items documented as reverse-keyed, the contribution is calculated as 6 minus your 1–5 response. Percentages in this report normalize each type between its possible minimum and maximum; they are not population percentiles or probabilities.',
    'Nueve does not derive wings, instinctual subtypes, tritypes, or clinical conclusions because the selected assessment does not document those outputs.',
  ];
  let y = 178;
  paragraphs.forEach((paragraph) => {
    const lines = document.splitTextToSize(paragraph, width - 96);
    document.text(lines, 48, y, { lineHeightFactor: 1.55 });
    y += lines.length * 17 + 24;
  });
  document.setDrawColor(65, 62, 51);
  document.line(48, y + 8, width - 48, y + 8);
  document.setTextColor(194, 181, 149);
  document.setFont('helvetica', 'bold');
  document.text('SOURCE & ATTRIBUTION', 48, y + 42);
  document.setFont('helvetica', 'normal');
  document.setTextColor(177, 170, 151);
  const sourceText = [
    `${OEPS.title} ${OEPS.version}, developed by Eric Jorgenson / Open-Source Psychometrics Project.`,
    `Source: ${OEPS.sourceUrl}`,
    `License: ${OEPS.license} — creativecommons.org/licenses/by-nc-sa/4.0/`,
    'Adaptation note: Nueve preserves the published item wording and scoring keys, while presenting the questionnaire one item at a time and normalizing raw scores for visual comparison.',
    'The official documentation page currently describes 57 items, while its downloadable v2 scoring form contains and scores 54. This report follows the downloadable scoring form.',
  ];
  y += 68;
  sourceText.forEach((line) => {
    const lines = document.splitTextToSize(line, width - 96);
    document.text(lines, 48, y, { lineHeightFactor: 1.5 });
    y += lines.length * 16 + 9;
  });
  document.setTextColor(139, 134, 121);
  document.setFontSize(9);
  document.text('This experience is intended for education and self-reflection and is not a clinical psychological assessment or diagnosis.', 48, height - 52);
  document.save(`nueve-type-${dominant.type}-report.pdf`);
}
