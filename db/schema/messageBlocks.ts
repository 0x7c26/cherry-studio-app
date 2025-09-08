import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const messageBlocks = sqliteTable(
  'message_blocks',
  {
    id: text('id').notNull().unique().primaryKey(),
    message_id: text('message_id').notNull(),
    type: text('type').notNull(), // MessageBlockType enum values
    created_at: text('created_at').notNull(),
    updated_at: text('updated_at'),
    status: text('status').notNull(), // MessageBlockStatus enum values
    model: text('model'), // Model object as JSON
    metadata: text('metadata'), // Record<string, any> as JSON
    error: text('error'), // Record<string, any> as JSON

    // Content fields - used by different block types
    content: text('content'), // Main content for text, code, thinking blocks
    language: text('language'), // For code blocks
    url: text('url'), // For image blocks
    file: text('file'), // FileMetadata object as JSON for image/file blocks

    // Tool block specific fields
    tool_id: text('tool_id'), // For tool blocks
    tool_name: text('tool_name'), // For tool blocks
    arguments: text('arguments'), // Record<string, any> as JSON for tool blocks

    // Translation block specific fields
    source_block_id: text('source_block_id'), // For translation blocks
    source_language: text('source_language'), // For translation blocks
    target_language: text('target_language'), // For translation blocks

    // Citation block specific fields
    response: text('response'), // WebSearchResponse as JSON
    knowledge: text('knowledge'), // KnowledgeReference[] as JSON

    // Thinking block specific fields
    thinking_millsec: integer('thinking_millsec'), // For thinking blocks

    // Main text block specific fields
    knowledge_base_ids: text('knowledge_base_ids'), // string[] as JSON
    citation_references: text('citation_references') // Citation references as JSON
  },
  table => [index('idx_message_blocks_message_id').on(table.message_id)]
)
