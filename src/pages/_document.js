// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" version={process.env.NEXT_PUBLIC_WEB_VERSION}>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0277fa" />

        <script async defer src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_PLACE_API_KEY}&libraries=places&loading=async`}></script>
      </Head>
      <body className="!pointer-events-auto">
        <Main />
        <NextScript />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </body>
    </Html>
  );
}

