import { type SchemaTypeDefinition } from 'sanity'
import { post } from './post'
import { category } from './category'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, category],
}
