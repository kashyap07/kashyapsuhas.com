import Link from 'next/link';

import { Wrapper } from '@/components/ui';

export default function Contact() {
  return (
    <Wrapper className="flex w-full flex-col items-center justify-center gap-14">
      <div className="mx-auto flex w-full flex-col gap-3">
        <h2 className="text-xl">WORK</h2>
        <ul className="flex flex-col gap-6">
          <li className="flex items-center justify-between text-5xl">
            <Link href={"mailto:mantles_arbours_00@icloud.com"}>mail</Link>
          </li>
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://www.linkedin.com/in/suhas-kashyap/"}>
              LinkedIn
            </Link>
          </li>
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://github.com/kashyap07"}>GitHub</Link>
          </li>
        </ul>
      </div>

      <div className="mx-auto flex w-full flex-col gap-3">
        <h2 className="text-xl">SOCIALS</h2>
        <ul className="flex flex-col gap-6">
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://twitter.com/kashyapS07"}>𝕏</Link>
          </li>
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://www.instagram.com/kashyap_07"}>Instagram</Link>
          </li>
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://www.facebook.com/kashyapsuhas07"}>
              Facebook
            </Link>
          </li>
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://www.youtube.com/c/SuhasKashyap07"}>
              YouTube
            </Link>
          </li>
          <li className="flex items-center justify-between text-5xl">
            <Link href={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}>
              reddit
            </Link>
          </li>
        </ul>
      </div>
    </Wrapper>
  );
}
