import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Product Review",
  type: "document",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Clerk User ID",
    }),
    defineField({
      name: "userName",
      title: "User Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "userEmail",
      title: "User Email",
      type: "string",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: "comment",
      title: "Comment",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().min(10).max(1000),
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "verified",
      title: "Verified Purchase",
      type: "boolean",
      initialValue: false,
      description: "Set to true if user purchased this product",
    }),
  ],
  preview: {
    select: {
      title: "userName",
      subtitle: "comment",
      rating: "rating",
    },
    prepare({ title, subtitle, rating }) {
      return {
        title: `${title} - ${rating}⭐`,
        subtitle: subtitle?.substring(0, 60) + "...",
      };
    },
  },
});
