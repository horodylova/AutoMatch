import { defineField, defineType } from 'sanity'

export const poll = defineType({
  name: 'poll',
  title: 'Two‑Option Poll',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required().min(6),
    }),
    defineField({
      name: 'optionA',
      title: 'Left Option',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'optionB',
      title: 'Right Option',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { q: 'question', a: 'optionA', b: 'optionB' },
    prepare({ q, a, b }) {
      return {
        title: `Poll: ${q || ''}`,
        subtitle: `${a || 'Left'} vs ${b || 'Right'}`,
      }
    },
  },
})
