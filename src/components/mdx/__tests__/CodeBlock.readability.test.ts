import fs from "fs";
import path from "path";

// reader modes (safari reader, and the readability lineage every "reader
// view" descends from) weight an element by its class string and delete
// anything scoring negative. a code block wrapped in `overflow-hidden` or
// `code-scroll` matched "hidden" / "scroll" and got dropped from the article
// entirely, so posts read in safari reader or piped through text extraction
// lost every fence. this pins the class names so it cannot come back.
//
// regex copied verbatim from @mozilla/readability REGEXPS.negative.
const NEGATIVE =
  /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i;

const source = fs.readFileSync(
  path.join(__dirname, "..", "CodeBlock.tsx"),
  "utf-8",
);

// className="..." literals only. comments in the file mention the banned
// words on purpose (explaining the bug), so scanning the whole file would
// fail on its own documentation.
const classNames = [...source.matchAll(/className="([^"]*)"/g)].map(
  (m) => m[1],
);

describe("CodeBlock reader-mode survival", () => {
  it("has class names to check", () => {
    expect(classNames.length).toBeGreaterThan(0);
  });

  it.each(classNames)("class %p scores non-negative in reader mode", (cls) => {
    expect(NEGATIVE.test(cls)).toBe(false);
  });
});
