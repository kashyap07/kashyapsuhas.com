import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: "2b7821f2-dae9-4ebd-bd04-e7bc32a1c1ff", // Get this from tina.io
  token: "71afb7a70cdac93e7c12a8a9869fdf35fe83d927", // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        label: "Posts",
        name: "posts",
        path: "Blog",
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["Tech", "Food", "Travel", "Life"],
            required: true,
          },
          {
            type: "datetime",
            name: "creation_date",
            label: "Creation Date",
            required: true,
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
            ui: {
              component: "tags",
            },
          },
          {
            type: "image",
            name: "hero_image",
            label: "Hero Image",
          },
          {
            type: "boolean",
            name: "draft",
            label: "Draft",
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            required: true,
          },
        ],
      },
    ],
  },
});
