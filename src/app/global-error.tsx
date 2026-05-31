"use client";

// catches errors that escape the root layout. must render its own html + body
// because the root layout failed.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          fontFamily: "ui-serif, Georgia, serif",
          background: "#ffffff",
          color: "#1e293b",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "6rem", margin: 0, lineHeight: 1 }}>500</h1>
        <p style={{ fontSize: "1.5rem", margin: 0 }}>something broke</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={reset}
            style={{
              fontSize: "1.25rem",
              color: "#f0a044",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            try again
          </button>
          <a
            href="/"
            style={{
              fontSize: "1.25rem",
              color: "#f0a044",
              textDecoration: "none",
            }}
          >
            go home
          </a>
        </div>
      </body>
    </html>
  );
}
