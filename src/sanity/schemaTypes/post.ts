import { defineField, defineType, type Rule } from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (Rule: Rule) => Rule.required(),
          options: {
            isHighlighted: true
          }
        }
      ]
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags'
      }
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'poll',
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: (Rule: Rule) => Rule.required(),
              options: {
                isHighlighted: true
              }
            },
            {
              name: 'position',
              type: 'string',
              title: 'Position',
              options: {
                list: [
                  { title: 'Center (Full Width)', value: 'center' },
                  { title: 'Left (Float)', value: 'left' },
                  { title: 'Right (Float)', value: 'right' }
                ],
                layout: 'radio',
                isHighlighted: true
              },
              initialValue: 'center'
            },
            {
              name: 'link',
              type: 'url',
              title: 'Link URL',
              description: 'Optional link for the image (e.g., for banners)',
              options: {
                isHighlighted: true
              }
            }
          ]
        },
        {
          type: 'file',
          name: 'videoBanner',
          title: 'Video Banner',
          options: { accept: 'video/*' },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              validation: (Rule: Rule) => Rule.required(),
            },
            {
              name: 'position',
              type: 'string',
              title: 'Position',
              options: {
                list: [
                  { title: 'Center (Full Width)', value: 'center' },
                  { title: 'Left (Float)', value: 'left' },
                  { title: 'Right (Float)', value: 'right' }
                ],
                layout: 'radio',
                isHighlighted: true
              },
              initialValue: 'center'
            },
            {
              name: 'link',
              type: 'url',
              title: 'Link URL',
              description: 'Optional link for the video banner',
              options: {
                isHighlighted: true
              }
            }
          ]
        }
      ]
    }),
    defineField({
      name: 'isFeatured',
      title: 'Is Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Check if this post should be featured on the blog page'
    })
  ],
})
