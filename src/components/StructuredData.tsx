import { type Thing, type WithContext } from "schema-dts";

interface StructuredDataProps {
  data: WithContext<Thing>;
}

/**
 * Component for adding JSON-LD structured data to pages for SEO
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
