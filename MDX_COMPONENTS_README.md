# MDX Components Documentation

## Available Components

Your blog posts now support custom React components! Use these directly in your MDX files without importing.

### Callout

Highlight important information with styled callouts.

**Props:**

- `type`: `"info"` | `"warning"` | `"success"` | `"danger"` (default: `"info"`)
- `title`: Optional title text
- `children`: Content of the callout

**Example:**

```mdx
<Callout type="warning" title="Important">
  This is a warning message with a title!
</Callout>

<Callout type="info">This is a simple info callout without a title.</Callout>
```

### YouTube

Embed YouTube videos responsively.

**Props:**

- `id`: YouTube video ID (required)
- `title`: Optional title for accessibility (default: "YouTube video")

**Example:**

```mdx
<YouTube id="dQw4w9WgXcQ" title="Never Gonna Give You Up" />
```

### CodeBlock

Wrap code blocks with a title.

**Props:**

- `title`: Optional title shown above the code
- `children`: The code block content

**Example:**

```mdx
<CodeBlock title="example.js">
  \`\`\`javascript const greeting = "Hello World"; console.log(greeting); \`\`\`
</CodeBlock>
```

### Grid

Create responsive grid layouts.

**Props:**

- `cols`: `2` | `3` | `4` (default: `2`) - Number of columns on larger screens
- `children`: Grid items

**Example:**

```mdx
<Grid cols={3}>
  <div>First item</div>
  <div>Second item</div>
  <div>Third item</div>
</Grid>
```

## Adding New Components

To add more components:

1. Create a new component in `src/components/mdx/`
2. Export it from `src/components/mdx/index.ts`
3. It will automatically be available in all MDX blog posts!

## Example Blog Post

See `content/blog/mdx-components-demo.mdx` for a complete example using all components.
