import { Metadata } from "next";

import { Wrapper } from "@components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for kashyapsuhas.com",
  alternates: {
    canonical: "https://www.kashyapsuhas.com/privacy",
  },
};

export const dynamic = "force-static";

export default function Privacy() {
  return (
    <Wrapper className="mb-section-sm w-full md:mb-section-md">
      <article className="prose prose-lg">
        <h1>Privacy</h1>
        <p>
          This site does not collect personal data. It does not set cookies. It
          does not run advertising. It is a personal site.
        </p>

        <h2>What gets collected</h2>
        <p>
          I use two third party services that process aggregate request data:
        </p>
        <ul>
          <li>
            <strong>Umami</strong> (cloud.umami.is): cookieless, aggregate page
            view counts. No personal identifiers, no cross-site tracking.
          </li>
          <li>
            <strong>Vercel Speed Insights</strong>: aggregate Core Web Vitals
            measurements for performance monitoring. No personal identifiers.
          </li>
        </ul>
        <p>
          Neither service stores cookies on your device. Neither can identify
          you individually.
        </p>

        <h2>Hosting</h2>
        <p>
          The site is hosted on Vercel. Vercel records standard server logs (IP
          address, user agent, request path) for security and abuse prevention.
          See{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel&apos;s privacy policy
          </a>
          .
        </p>

        <h2>Email contact</h2>
        <p>
          If you email{" "}
          <a href="mailto:mail@kashyapsuhas.com">mail@kashyapsuhas.com</a>, your
          message is stored in my inbox. I don&apos;t share it with anyone. You
          can ask me to delete it at any time.
        </p>

        <h2>Browser tools</h2>
        <p>
          The tools at <a href="/tools">/tools</a> (image compressor, background
          remover, image converter) run entirely in your browser. Files you
          upload never leave your device.
        </p>

        <h2>Your rights</h2>
        <p>
          If you&apos;re in the EU, UK, or California, you have the right to
          request access to or deletion of any personal data I hold about you.
          Since I don&apos;t collect any, there&apos;s usually nothing to act
          on. Email me if you have questions.
        </p>

        <h2>Changes</h2>
        <p>
          This policy may change. The current version is always at this URL.
        </p>
      </article>
    </Wrapper>
  );
}
