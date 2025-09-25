# Data Structure Documentation

This document provides a comprehensive overview of the data structures used in Cherry Studio App, organized by storage type.

## Redux Store Structure

The application state is managed using Redux Toolkit with persistence via AsyncStorage. All slices except `runtime` are persisted automatically.

### Store Slices

#### `app` - Application State

```typescript
interface RuntimeState {
  initialized: boolean // App initialization status
  welcomeShown: boolean // Whether welcome screen has been shown
}
```

#### `assistant` - Assistant Management

```typescript
interface AssistantsState {
  builtInAssistants: Assistant[] // Built-in AI assistants
}
```

#### `settings` - User Settings

```typescript
interface SettingsState {
  avatar: string // User avatar image path
  userName: string // User display name
  userId: string // Unique user identifier
  theme: ThemeMode // App theme (light/dark/system)
}
```

#### `topic` - Current Topic State

```typescript
interface TopicState {
  currentTopicId: string // Currently active conversation topic ID
}
```

#### `websearch` - Web Search Configuration

```typescript
interface WebSearchState {
  searchWithTime: boolean // Add current date to search queries
  maxResults: number // Maximum search results count
  excludeDomains: string[] // Domains to exclude from search
  subscribeSources: SubscribeSource[] // Subscription sources for blacklists
  overrideSearchService: boolean // Override search service settings
  contentLimit?: number // Content limit for search results
  providerConfig: Record<string, any> // Provider-specific configurations
}

interface SubscribeSource {
  key: number // Unique identifier
  url: string // Source URL
  name: string // Display name
  blacklist?: string[] // Domain blacklist from this source
}
```

#### `runtime` - Temporary State (Not Persisted)

```typescript
interface RuntimeState {
  timestamp: number // Current timestamp
  export: { isExporting: boolean } // Export operation state
  websearch: {
    activeSearches: Record<string, WebSearchStatus> // Active web searches
  }
}
```

#### `messages` - Message Management (Entity Adapter)

```typescript
interface MessagesState extends EntityState<Message, string> {
  messageIdsByTopic: Record<string, string[]> // Topic-to-message mapping
  currentTopicId: string | null // Current active topic
  loadingByTopic: Record<string, boolean> // Loading state per topic
  displayCount: number // Number of messages to display
}
```

## SQLite Database Schema

The application uses SQLite with Drizzle ORM for persistent data storage. All tables use text-based primary keys for consistency.

### Core Tables

#### `assistants` - AI Assistant Configurations

```sql
CREATE TABLE assistants (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'built_in',
  emoji TEXT,
  description TEXT,
  model TEXT,
  default_model TEXT,
  settings TEXT,                        -- JSON configuration
  enable_web_search BOOLEAN,
  enable_generate_image BOOLEAN,
  knowledge_recognition TEXT,
  tags TEXT,
  group TEXT,
  websearch_provider_id TEXT
);
```

#### `topics` - Conversation Topics

```sql
CREATE TABLE topics (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  assistant_id TEXT NOT NULL REFERENCES assistants(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  messages TEXT NOT NULL DEFAULT '[]',   -- JSON array of message IDs
  pinned BOOLEAN,
  prompt TEXT,
  is_name_manually_edited BOOLEAN
);

-- Indexes for performance
CREATE INDEX idx_topics_assistant_id ON topics(assistant_id);
CREATE INDEX idx_topics_created_at ON topics(created_at);
CREATE INDEX idx_topics_assistant_id_created_at ON topics(assistant_id, created_at);
```

#### `messages` - Chat Messages

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  role TEXT NOT NULL,                   -- user, assistant, system
  assistant_id TEXT NOT NULL REFERENCES assistants(id),
  topic_id TEXT NOT NULL REFERENCES topics(id),
  created_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL,                 -- processing, success, error, etc.
  model_id TEXT,
  model TEXT,
  type TEXT,
  useful BOOLEAN,                       -- User feedback
  ask_id TEXT,                         -- Groups related messages
  mentions TEXT,                       -- JSON array of mentions
  usage TEXT,                          -- JSON usage statistics
  metrics TEXT,                        -- JSON performance metrics
  multi_model_message_style TEXT,
  fold_selected BOOLEAN
);

-- Indexes for performance
CREATE INDEX idx_messages_topic_id ON messages(topic_id);
CREATE INDEX idx_messages_assistant_id ON messages(assistant_id);
```

#### `message_blocks` - Message Content Blocks

```sql
CREATE TABLE message_blocks (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  message_id TEXT NOT NULL,
  type TEXT NOT NULL,                   -- text, code, image, tool, etc.
  created_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL,                 -- processing, success, error, etc.
  model TEXT,                          -- JSON model configuration
  metadata TEXT,                       -- JSON metadata
  error TEXT,                          -- JSON error information

  -- Content fields (used by different block types)
  content TEXT,                        -- Main content
  language TEXT,                       -- Programming language for code blocks
  url TEXT,                           -- URL for image blocks
  file TEXT,                          -- JSON FileMetadata for attachments

  -- Tool block specific
  tool_id TEXT,
  tool_name TEXT,
  arguments TEXT,                      -- JSON tool arguments

  -- Translation block specific
  source_block_id TEXT,
  source_language TEXT,
  target_language TEXT,

  -- Citation block specific
  response TEXT,                       -- JSON WebSearchResponse
  knowledge TEXT,                      -- JSON KnowledgeReference[]

  -- Thinking block specific
  thinking_millsec INTEGER,

  -- Main text block specific
  knowledge_base_ids TEXT,             -- JSON string array
  citation_references TEXT             -- JSON citation references
);

-- Index for performance
CREATE INDEX idx_message_blocks_message_id ON message_blocks(message_id);
```

### Configuration Tables

#### `providers` - LLM Service Providers

```sql
CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                   -- openai, anthropic, google, etc.
  name TEXT NOT NULL,
  api_key TEXT,
  api_host TEXT,
  api_version TEXT,
  models TEXT,                         -- JSON array of available models
  enabled BOOLEAN,
  is_system BOOLEAN,                   -- System-provided vs user-added
  is_authed BOOLEAN,                   -- Authentication status
  rate_limit INTEGER,
  is_not_support_array_content BOOLEAN,
  notes TEXT
);
```

#### `websearch_providers` - Web Search Services

```sql
CREATE TABLE websearch_providers (
  id TEXT PRIMARY KEY,
  name TEXT,
  api_key TEXT,
  api_host TEXT,
  engines TEXT,                        -- JSON array of search engines
  url TEXT,
  basic_auth_username TEXT,
  basic_auth_password TEXT,
  content_limit INTEGER,
  using_browser BOOLEAN
);
```

### Storage and Knowledge Tables

#### `files` - Uploaded Files

```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  origin_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  ext TEXT NOT NULL,
  count INTEGER NOT NULL,              -- Reference count
  type TEXT NOT NULL,                  -- image, document, etc.
  mime_type TEXT NOT NULL,
  md5 TEXT NOT NULL
);
```

#### `knowledges` - Knowledge Bases

```sql
CREATE TABLE knowledges (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,                 -- Embedding model
  dimensions INTEGER NOT NULL,         -- Vector dimensions
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version TEXT NOT NULL,
  document_count INTEGER,
  chunk_size INTEGER,
  chunk_overlap INTEGER,
  threshold INTEGER,
  rerank_model TEXT,
  items TEXT NOT NULL                  -- JSON knowledge items
);
```

#### `backup_providers` - Backup Configurations

```sql
CREATE TABLE backup_providers (
  id TEXT PRIMARY KEY,
  name TEXT,
  config TEXT                          -- JSON configuration
);
```

## Data Relationships

### Primary Relationships

- `assistants` → `topics` (one-to-many)
- `topics` → `messages` (one-to-many)
- `messages` → `message_blocks` (one-to-many)
- `assistants` → `messages` (one-to-many)
- `websearch_providers` → `assistants` (one-to-many via websearch_provider_id)

### Data Flow

1. **User creates conversation** → New `topic` created, linked to `assistant`
2. **User sends message** → New `message` created, linked to `topic` and `assistant`
3. **Assistant responds** → Multiple `message_blocks` created for different content types
4. **Files uploaded** → Stored in `files` table, referenced in message blocks
5. **Web search triggered** → Results stored in citation blocks

## Storage Considerations

### Redux Store

- **Persisted**: app, assistant, settings, topic, websearch, messages
- **Not Persisted**: runtime (temporary state)
- **Storage**: AsyncStorage (React Native)

### SQLite Database

- **Location**: Local device storage via Expo SQLite
- **Migrations**: Managed by Drizzle ORM
- **Indexes**: Optimized for common query patterns (topic/message lookups)
- **JSON Fields**: Complex objects stored as JSON text for flexibility
