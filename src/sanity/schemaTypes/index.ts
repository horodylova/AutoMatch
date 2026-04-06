import { type SchemaTypeDefinition } from 'sanity'
import { post } from './post'
import { category } from './category'
import { poll } from './poll'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, category, poll],
}
