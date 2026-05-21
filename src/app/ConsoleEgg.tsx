"use client";

import { useEffect } from "react";

export default function ConsoleEgg() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      "%cwhatchu lookin' at?",
      "color:#f0a044;font:600 18px ui-serif,serif;",
    );
  }, []);
  return null;
}
