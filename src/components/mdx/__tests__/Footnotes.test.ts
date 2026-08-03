import { scanFootnotes } from "../Footnotes";

const nums = (source: string) =>
  Object.fromEntries(
    [...scanFootnotes(source)].map(([id, entry]) => [id, entry.num]),
  );

describe("footnote numbering", () => {
  it("numbers by first appearance in the source, not by id or list order", () => {
    const source = `intro<Fn id="zebra" /> then<Fn id="apple" /> then<Fn id="mango" />`;
    expect(nums(source)).toEqual({ zebra: 1, apple: 2, mango: 3 });
  });

  it("renumbers everything after an inserted marker", () => {
    const before = `a<Fn id="one" /> b<Fn id="two" />`;
    const after = `a<Fn id="one" /> mid<Fn id="new" /> b<Fn id="two" />`;
    expect(nums(before)).toEqual({ one: 1, two: 2 });
    // the whole point of the id scheme: "two" moves to 3 with no hand editing
    expect(nums(after)).toEqual({ one: 1, new: 2, two: 3 });
  });

  it("keeps one number for a repeated marker and counts the refs", () => {
    const index = scanFootnotes(
      `a<Fn id="dup" /> b<Fn id="other" /> c<Fn id="dup" />`,
    );
    expect(index.get("dup")).toEqual({ num: 1, refs: 2 });
    expect(index.get("other")).toEqual({ num: 2, refs: 1 });
  });

  it("handles ids with dashes and digits, and ignores prose that looks close", () => {
    const source = `x<Fn id="33-crore" /> y<Fn id="ka-01" /> mentioning <Fn n={1} /> and Fn id="nope"`;
    expect(nums(source)).toEqual({ "33-crore": 1, "ka-01": 2 });
  });

  it("returns an empty index for a post with no footnotes", () => {
    expect(scanFootnotes("just some prose")).toEqual(new Map());
  });
});
