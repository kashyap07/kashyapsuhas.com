"use client";

import React, { useState } from "react";

import { Wrapper } from "@/components/ui";

function diffWordsInline(a: string, b: string) {
  const aWords = a.split(/(\s+)/);
  const bWords = b.split(/(\s+)/);
  const result: React.ReactNode[] = [];
  let i = 0,
    j = 0;
  while (i < aWords.length && j < bWords.length) {
    if (aWords[i] === bWords[j]) {
      result.push(<span key={i + "-" + j}>{aWords[i]}</span>);
      i++;
      j++;
    } else {
      result.push(
        <span key={"del-" + i} className="bg-red-200 text-red-800 line-through">
          {aWords[i]}
        </span>,
      );
      result.push(
        <span
          key={"add-" + j}
          className="bg-green-200 text-green-800 underline"
        >
          {bWords[j]}
        </span>,
      );
      i++;
      j++;
    }
  }
  while (i < aWords.length) {
    result.push(
      <span key={"del-" + i} className="bg-red-200 text-red-800 line-through">
        {aWords[i]}
      </span>,
    );
    i++;
  }
  while (j < bWords.length) {
    result.push(
      <span key={"add-" + j} className="bg-green-200 text-green-800 underline">
        {bWords[j]}
      </span>,
    );
    j++;
  }
  return result;
}

function diffLinesInline(a: string, b: string) {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const maxLines = Math.max(aLines.length, bLines.length);
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < maxLines; i++) {
    const aLine = aLines[i] || "";
    const bLine = bLines[i] || "";
    const diff = diffWordsInline(aLine, bLine);
    lines.push(
      <div key={"line-" + i} className="flex items-start gap-2">
        <span className="w-8 select-none pt-0.5 text-right text-xs text-gray-400">
          {i + 1}
        </span>
        <span className="flex-1 whitespace-pre-wrap break-words text-base">
          {diff}
        </span>
      </div>,
    );
  }
  return lines;
}

export default function TextDiffPage() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const lines = diffLinesInline(textA, textB);

  return (
    <Wrapper maxWidth="NARROW" className="mb-12 w-full md:mb-20">
      <h1 className="text-5xl font-medium md:text-8xl">Text Diff Tool</h1>
      <div className="flex flex-col gap-4 md:flex-row">
        <label className="block w-full md:w-1/2">
          <span className="text-sm font-medium">First Text</span>
          <textarea
            className="mt-1 min-h-[80px] w-full resize-y rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="first text goes here"
          />
        </label>
        <label className="block w-full md:w-1/2">
          <span className="text-sm font-medium">Second Text</span>
          <textarea
            className="mt-1 min-h-[80px] w-full resize-y rounded border p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="second text goes here"
          />
        </label>
      </div>
      <div className="mt-2 min-h-[48px] overflow-x-auto rounded border bg-gray-50 p-3">
        {textA || textB ? (
          <div className="flex flex-col gap-1">{lines}</div>
        ) : (
          <span className="text-gray-400">diff will appear here</span>
        )}
      </div>
      <div className="mt-2 text-center text-xs text-gray-500">
        Words removed are{" "}
        <span className="bg-red-200 px-1 text-red-800 line-through">
          highlighted
        </span>
        , words added are{" "}
        <span className="bg-green-200 px-1 text-green-800 underline">
          highlighted
        </span>
        .
      </div>
    </Wrapper>
  );
}
