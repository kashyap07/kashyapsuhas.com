import Link from "next/link";

import { Wrapper } from "@/components/Wrapper";
import { MaxWidth } from "@/variables/sizes";

export default function Contact() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-24 md:p-24">
      <Wrapper
        maxWidth={MaxWidth.Narrow}
        className="mb-12 md:mb-20 flex w-full flex-col items-center justify-center gap-2"
      >
        <div className="mx-auto mb-10 flex flex-col gap-2 w-full">
          <h2 className="text-3xl">WORK</h2>
          <ul className="flex flex-col gap-4 md:gap-8">
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"mailto:kashyapsuhas07@gmail.com"}>MAIL</Link>
            </li>
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://www.linkedin.com/in/suhas-kashyap/"}>
                LINKEDIN
              </Link>
            </li>
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://github.com/kashyap07"}>GITHUB</Link>
            </li>
          </ul>
        </div>

        <div className="mx-auto mb-10 flex flex-col gap-2 w-full">
          <h2 className="text-3xl">SOCIALS</h2>
          <ul className="flex flex-col gap-4 md:gap-8">
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://twitter.com/kashyapS07"}>𝕏</Link>
            </li>
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://www.instagram.com/kashyap_07"}>
                INSTAGRAM
              </Link>
            </li>
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://www.facebook.com/kashyapsuhas07"}>
                FACEBOOK
              </Link>
            </li>
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://www.youtube.com/c/SuhasKashyap07"}>
                YOUTUBE
              </Link>
            </li>
            <li className="flex items-center justify-between text-5xl md:text-9xl">
              <Link href={"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}>
                REDDIT
              </Link>
            </li>
          </ul>
        </div>
      </Wrapper>
    </main>
  );
}
