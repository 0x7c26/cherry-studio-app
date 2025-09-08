import { Search } from '@tamagui/lucide-icons'
import React from 'react'
import { styled, XStack } from 'tamagui'
import { Text } from 'tamagui'

import { WebSearchToolInput, WebSearchToolOutput } from '@/aiCore/tools/WebSearchTool'
import Searching from '@/components/ui/Searching'
import i18n from '@/i18n'
import { MCPToolResponse } from '@/types/mcp'

export const MessageWebSearchToolTitle = ({ toolResponse }: { toolResponse: MCPToolResponse }) => {
  const toolInput = toolResponse.arguments as WebSearchToolInput
  const toolOutput = toolResponse.response as WebSearchToolOutput
  return toolResponse.status !== 'done' ? (
    <Searching
      text={
        <PrepareToolWrapper>
          <Text fontSize={14} color="$textSecondary">
            {i18n.t('message.searching')}
          </Text>
          <Text fontSize={14} maxWidth="70%" numberOfLines={1} ellipsizeMode="tail" color="$textSecondary">
            {toolInput?.additionalContext ?? ''}
          </Text>
        </PrepareToolWrapper>
      }
    />
  ) : (
    <MessageWebSearchToolTitleTextWrapper>
      <Search size={16} color="$textSecondary" />
      <Text fontSize={14} color="$textSecondary">
        {i18n.t('message.websearch.fetch_complete', {
          count: toolOutput?.searchResults?.results?.length ?? 0
        })}
      </Text>
    </MessageWebSearchToolTitleTextWrapper>
  )
}

const PrepareToolWrapper = styled(XStack, {
  name: 'PrepareToolWrapper',
  flex: 1,
  alignItems: 'center',
  gap: 10,
  paddingLeft: 0
})
const MessageWebSearchToolTitleTextWrapper = styled(XStack, {
  name: 'MessageWebSearchToolTitleTextWrapper',
  alignItems: 'center',
  gap: 4
})
