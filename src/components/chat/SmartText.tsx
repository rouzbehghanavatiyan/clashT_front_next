"use client";

import React from "react";

const PERSIAN_ARABIC_RANGE = [
  [0x0600, 0x06ff],
  [0x0750, 0x077f],
  [0xfb50, 0xfdff],
  [0xfe70, 0xfeff],
];

const LATIN_RANGE = [
  [0x0000, 0x024f],
  [0x1e00, 0x1eff],
  [0x2000, 0x206f],
];

function inRanges(code: number, ranges: number[][]): boolean {
  return ranges.some(([start, end]) => code >= start && code <= end);
}

function getFontForCodePoint(code: number): string | undefined {
  if (inRanges(code, PERSIAN_ARABIC_RANGE)) return "var(--font-vazirmatn)";
  if (inRanges(code, LATIN_RANGE)) return "var(--font-vazirmatn)";
  return undefined;
}

const NEUTRAL_REGEX = /[\s\d.,!?;:'"()\-_/@#]/;

interface Segment {
  text: string;
  fontFamily?: string;
}

function splitByScript(text: string): Segment[] {
  if (!text) return [];

  const segments: Segment[] = [];
  let current = "";
  let currentFont: string | undefined;
  let currentFontSet = false;

  for (const ch of Array.from(text)) {
    const code = ch.codePointAt(0) ?? 0;
    const isNeutral = NEUTRAL_REGEX.test(ch);
    const font = isNeutral ? currentFont : getFontForCodePoint(code);

    if (!currentFontSet) {
      currentFont = font;
      currentFontSet = true;
    }

    if (font === currentFont || isNeutral) {
      current += ch;
    } else {
      segments.push({ text: current, fontFamily: currentFont });
      current = ch;
      currentFont = font;
    }
  }

  if (current) segments.push({ text: current, fontFamily: currentFont });

  return segments;
}

interface SmartTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: string | null;
}

export function SmartText({ children, style, className, ...rest }: SmartTextProps) {
  const text = typeof children === "string" ? children : "";
  const segments = splitByScript(text);

  return (
    <span className={className} style={style} {...rest}>
      {segments.map((seg, idx) => (
        <span key={idx} style={{ fontFamily: seg.fontFamily }}>
          {seg.text}
        </span>
      ))}
    </span>
  );
}

export default SmartText;
