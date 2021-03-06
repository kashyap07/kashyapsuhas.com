import Footer from "../components/Footer";
import Head from "next/head";
import Header from "../components/Header";
import "@styles/tailwind.css";
import "@styles/index.css";
import "@styles/CSSElements.css";
import "@styles/syntax-highlight.css";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Suhas Kashyap</title>
        <meta name="description" content="Suhas Kashyap's Personal site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Component {...pageProps} className="flex-body py-16" />
      <Footer className="flex-shrink-0" />
    </>
  );
}

export default MyApp;
