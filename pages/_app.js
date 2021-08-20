import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";

import "../styles/tailwind.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Suhas Kashyap</title>
        <meta name="description" content="Suhas Kashyap's Personal site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Component {...pageProps} className="flex-body overflow-hidden pb-0" />
      <Footer className="flex-shrink-0" />
    </>
  );
};

export default MyApp;
