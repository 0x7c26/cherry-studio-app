import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { websearch_providers } from './websearchProviders'

export const assistants = sqliteTable('assistants', {
  id: text('id').notNull().unique().primaryKey(),
  name: text('name').notNull(),
  prompt: text('prompt').notNull(),
  // knowledgeIds: text('knowledge_ids'),
  // todo add foreign key
  // .references(() => knowledges.id),
  type: text('type').notNull().default('assistant'),
  emoji: text('emoji'),
  description: text('description'),
  model: text('model'),
  default_model: text('default_model'),
  settings: text('settings'),
  enable_web_search: integer('enable_web_search', { mode: 'boolean' }),
  websearch_provider_id: text('websearch_provider_id').references(() => websearch_providers.id),
  enable_generate_image: integer('enable_generate_image', { mode: 'boolean' }),
  // mcpServers: blob('mcp_servers'),
  knowledge_recognition: text('knowledge_recognition'),
  tags: text('tags'),
  group: text('group'),
  isStar: integer('isStar', { mode: 'boolean' })
})
