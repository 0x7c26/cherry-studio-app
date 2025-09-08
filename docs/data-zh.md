# 数据结构文档

本文档全面概述了 Cherry Studio App 中使用的数据结构，按存储类型组织。

## Redux Store 结构

应用状态通过 Redux Toolkit 管理，并通过 AsyncStorage 进行持久化。除 `runtime` 外的所有 slice 都会自动持久化。

### Store Slices

#### `app` - 应用状态
```typescript
interface RuntimeState {
  initialized: boolean      // 应用初始化状态
  welcomeShown: boolean     // 是否已显示欢迎界面
}
```

#### `assistant` - 助手管理
```typescript
interface AssistantsState {
  builtInAssistants: Assistant[]  // 内置 AI 助手
}
```

#### `settings` - 用户设置
```typescript
interface SettingsState {
  avatar: string           // 用户头像图片路径
  userName: string         // 用户显示名称
  userId: string          // 唯一用户标识符
  theme: ThemeMode        // 应用主题 (light/dark/system)
}
```

#### `topic` - 当前话题状态
```typescript
interface TopicState {
  currentTopicId: string   // 当前活跃的对话话题 ID
}
```

#### `websearch` - 网页搜索配置
```typescript
interface WebSearchState {
  searchWithTime: boolean              // 在搜索查询中添加当前日期
  maxResults: number                   // 最大搜索结果数量
  excludeDomains: string[]             // 搜索中排除的域名
  subscribeSources: SubscribeSource[]  // 黑名单的订阅源
  overrideSearchService: boolean       // 覆盖搜索服务设置
  contentLimit?: number                // 搜索结果内容限制
  providerConfig: Record<string, any>  // 提供商特定配置
}

interface SubscribeSource {
  key: number           // 唯一标识符
  url: string          // 源 URL
  name: string         // 显示名称
  blacklist?: string[] // 来自此源的域名黑名单
}
```

#### `runtime` - 临时状态（不持久化）
```typescript
interface RuntimeState {
  timestamp: number                              // 当前时间戳
  export: { isExporting: boolean }               // 导出操作状态
  websearch: {
    activeSearches: Record<string, WebSearchStatus>  // 活跃的网页搜索
  }
}
```

#### `messages` - 消息管理（实体适配器）
```typescript
interface MessagesState extends EntityState<Message, string> {
  messageIdsByTopic: Record<string, string[]>  // 话题到消息的映射
  currentTopicId: string | null                // 当前活跃话题
  loadingByTopic: Record<string, boolean>      // 每个话题的加载状态
  displayCount: number                         // 要显示的消息数量
}
```

## SQLite 数据库架构

应用使用 SQLite 与 Drizzle ORM 进行持久数据存储。所有表都使用基于文本的主键以保持一致性。

### 核心表

#### `assistants` - AI 助手配置
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
  settings TEXT,                        -- JSON 配置
  enable_web_search BOOLEAN,
  enable_generate_image BOOLEAN,
  knowledge_recognition TEXT,
  tags TEXT,
  group TEXT,
  websearch_provider_id TEXT
);
```

#### `topics` - 对话话题
```sql
CREATE TABLE topics (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  assistant_id TEXT NOT NULL REFERENCES assistants(id),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  messages TEXT NOT NULL DEFAULT '[]',   -- 消息 ID 的 JSON 数组
  pinned BOOLEAN,
  prompt TEXT,
  is_name_manually_edited BOOLEAN
);

-- 性能索引
CREATE INDEX idx_topics_assistant_id ON topics(assistant_id);
CREATE INDEX idx_topics_created_at ON topics(created_at);
CREATE INDEX idx_topics_assistant_id_created_at ON topics(assistant_id, created_at);
```

#### `messages` - 聊天消息
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  role TEXT NOT NULL,                   -- user, assistant, system
  assistant_id TEXT NOT NULL REFERENCES assistants(id),
  topic_id TEXT NOT NULL REFERENCES topics(id),
  created_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL,                 -- processing, success, error, 等
  model_id TEXT,
  model TEXT,
  type TEXT,
  useful BOOLEAN,                       -- 用户反馈
  ask_id TEXT,                         -- 分组相关消息
  mentions TEXT,                       -- 提及的 JSON 数组
  usage TEXT,                          -- JSON 使用统计
  metrics TEXT,                        -- JSON 性能指标
  multi_model_message_style TEXT,
  fold_selected BOOLEAN
);

-- 性能索引
CREATE INDEX idx_messages_topic_id ON messages(topic_id);
CREATE INDEX idx_messages_assistant_id ON messages(assistant_id);
```

#### `message_blocks` - 消息内容块
```sql
CREATE TABLE message_blocks (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  message_id TEXT NOT NULL,
  type TEXT NOT NULL,                   -- text, code, image, tool, 等
  created_at TEXT NOT NULL,
  updated_at TEXT,
  status TEXT NOT NULL,                 -- processing, success, error, 等
  model TEXT,                          -- JSON 模型配置
  metadata TEXT,                       -- JSON 元数据
  error TEXT,                          -- JSON 错误信息

  -- 内容字段（不同块类型使用）
  content TEXT,                        -- 主要内容
  language TEXT,                       -- 代码块的编程语言
  url TEXT,                           -- 图片块的 URL
  file TEXT,                          -- 附件的 JSON FileMetadata

  -- 工具块特定
  tool_id TEXT,
  tool_name TEXT,
  arguments TEXT,                      -- JSON 工具参数

  -- 翻译块特定
  source_block_id TEXT,
  source_language TEXT,
  target_language TEXT,

  -- 引用块特定
  response TEXT,                       -- JSON WebSearchResponse
  knowledge TEXT,                      -- JSON KnowledgeReference[]

  -- 思考块特定
  thinking_millsec INTEGER,

  -- 主文本块特定
  knowledge_base_ids TEXT,             -- JSON 字符串数组
  citation_references TEXT             -- JSON 引用参考
);

-- 性能索引
CREATE INDEX idx_message_blocks_message_id ON message_blocks(message_id);
```

### 配置表

#### `providers` - LLM 服务提供商
```sql
CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                   -- openai, anthropic, google, 等
  name TEXT NOT NULL,
  api_key TEXT,
  api_host TEXT,
  api_version TEXT,
  models TEXT,                         -- 可用模型的 JSON 数组
  enabled BOOLEAN,
  is_system BOOLEAN,                   -- 系统提供 vs 用户添加
  is_authed BOOLEAN,                   -- 认证状态
  rate_limit INTEGER,
  is_not_support_array_content BOOLEAN,
  notes TEXT
);
```

#### `websearch_providers` - 网页搜索服务
```sql
CREATE TABLE websearch_providers (
  id TEXT PRIMARY KEY,
  name TEXT,
  api_key TEXT,
  api_host TEXT,
  engines TEXT,                        -- 搜索引擎的 JSON 数组
  url TEXT,
  basic_auth_username TEXT,
  basic_auth_password TEXT,
  content_limit INTEGER,
  using_browser BOOLEAN
);
```

### 存储和知识表

#### `files` - 上传的文件
```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  origin_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER NOT NULL,
  ext TEXT NOT NULL,
  count INTEGER NOT NULL,              -- 引用计数
  type TEXT NOT NULL,                  -- image, document, 等
  mime_type TEXT NOT NULL,
  md5 TEXT NOT NULL
);
```

#### `knowledges` - 知识库
```sql
CREATE TABLE knowledges (
  id TEXT PRIMARY KEY NOT NULL UNIQUE,
  name TEXT NOT NULL,
  model TEXT NOT NULL,                 -- 嵌入模型
  dimensions INTEGER NOT NULL,         -- 向量维度
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  version TEXT NOT NULL,
  document_count INTEGER,
  chunk_size INTEGER,
  chunk_overlap INTEGER,
  threshold INTEGER,
  rerank_model TEXT,
  items TEXT NOT NULL                  -- JSON 知识项目
);
```

#### `backup_providers` - 备份配置
```sql
CREATE TABLE backup_providers (
  id TEXT PRIMARY KEY,
  name TEXT,
  config TEXT                          -- JSON 配置
);
```

## 数据关系

### 主要关系
- `assistants` → `topics`（一对多）
- `topics` → `messages`（一对多）
- `messages` → `message_blocks`（一对多）
- `assistants` → `messages`（一对多）
- `websearch_providers` → `assistants`（通过 websearch_provider_id 一对多）

### 数据流
1. **用户创建对话** → 创建新 `topic`，链接到 `assistant`
2. **用户发送消息** → 创建新 `message`，链接到 `topic` 和 `assistant`
3. **助手回应** → 为不同内容类型创建多个 `message_blocks`
4. **文件上传** → 存储在 `files` 表中，在消息块中引用
5. **触发网页搜索** → 结果存储在引用块中

## 存储考虑

### Redux Store
- **持久化**：app、assistant、settings、topic、websearch、messages
- **不持久化**：runtime（临时状态）
- **存储**：AsyncStorage（React Native）

### SQLite 数据库
- **位置**：通过 Expo SQLite 的本地设备存储
- **迁移**：由 Drizzle ORM 管理
- **索引**：针对常见查询模式（话题/消息查找）优化
- **JSON 字段**：复杂对象存储为 JSON 文本以提供灵活性