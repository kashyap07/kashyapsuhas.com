import Head from "next/head";
import Header from "../components/Header";
import Wrapper from "../components/Wrapper";

import "tailwindcss/tailwind.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Suhas Kashyap</title>
        <meta name="description" content="Suhas Kashyap's Personal site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Wrapper>
        <Header />
        <Component {...pageProps} />
      </Wrapper>
    </>
  );
};

export default MyApp;
