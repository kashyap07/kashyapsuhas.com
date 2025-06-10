import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
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
      {
        name: "reviews",
        label: "Reviews",
        path: "content/reviews",
        format: "json",
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            required: true,
          },
          {
            type: "string",
            name: "category",
            label: "Category",
            required: true,
            options: [
              "Media",
              "Technology",
              "Vehicles",
              "Games",
              "Restaurants",
              "Services",
              "Travel",
              "Photography",
              "Others"
            ],
          },
          {
            type: "number",
            name: "rating",
            label: "Rating",
            required: true,
          },
          {
            type: "boolean",
            name: "wouldRecommend",
            label: "Would Recommend?",
            required: true,
          },
          {
            type: "string",
            name: "summary",
            label: "Summary",
            required: true,
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "pros",
            label: "Pros",
            list: true,
            required: true,
          },
          {
            type: "string",
            name: "cons",
            label: "Cons",
            list: true,
            required: true,
          },
          {
            type: "string",
            name: "link",
            label: "Link",
            required: false,
          },
          {
            type: "datetime",
            name: "reviewDate",
            label: "Review Date",
            required: false,
          },
        ],
      },
    ],
  },
});
