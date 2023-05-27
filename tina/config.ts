import { defineConfig } from "tinacms";
import {blog_postFields} from "./templates"

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: "2b7821f2-dae9-4ebd-bd04-e7bc32a1c1ff", // Get this from tina.io
  token: "71afb7a70cdac93e7c12a8a9869fdf35fe83d927", // Get this from tina.io
  client: { skip: true },
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
        format: "mdx",
        label: "Posts",
        name: "posts",
        path: "Blog",
        match: {
          include: "**/*",
        },
        fields: [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true,
          },
          ...blog_postFields(),
        ],
      },
    ],
  },
});
