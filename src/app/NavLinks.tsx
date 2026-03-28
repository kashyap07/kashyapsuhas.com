import Link from "next/link";

export default function NavLinks() {
  return (
    <ul className="flex flex-col gap-3 text-4xl">
      <li>
        <Link href={"/blog"}>Blog</Link>
      </li>
      <li>
        <Link href={"/photos"}>Photos</Link>
      </li>
      <li>
        <Link href={"/reviews"}>Reviews</Link>
      </li>
      <li>
        <Link href={"/tools"}>Tools</Link>
      </li>
      <li>
        <Link href={"/contact"}>Contact</Link>
      </li>
    </ul>
  );
}
