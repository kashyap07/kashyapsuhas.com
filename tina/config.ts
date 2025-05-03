import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "tina",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "/blog",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "blog",
        label: "Blog Posts",
        path: "content/blog",
        format: "mdx",
        defaultItem: () => ({
          publishedDateTime: new Date().toISOString(),
        }),
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
          },
          {
            type: "datetime",
            name: "publishedDateTime",
            label: "Published Date and Time",
            required: true,
            ui: {
              timeFormat: "hh:mm a",
            },
          },
          {
            name: "categories",
            type: "string",
            label: "Categories",
            list: true,
            options: [
              {
                value: "tech",
                label: "Tech",
              },
              {
                value: "food",
                label: "Food",
              },
              {
                value: "life",
                label: "Life",
              },
            ],
            required: false,
          },
          {
            type: "image",
            name: "heroImage",
            label: "Hero Image",
            required: false,
          },
          {
            type: "rich-text",
            name: "post",
            label: "Post",
            isBody: true,
          },
        ],
        // TODO: add preview feature some dat
      },
    ],
  },
});
