import React from 'react'
import { StyleSheet } from 'react-native'
import { Stack, View } from 'tamagui'

import { useMessageBlocks } from '@/hooks/useMessageBlocks'
import { Assistant } from '@/types/assistant'
import { Message, MessageBlockType } from '@/types/message'

import MessageBlockRenderer from './blocks'
import MessageContextMenu from './MessageContextMenu'

interface Props {
  message: Message
  assistant?: Assistant
}

const MessageContent: React.FC<Props> = ({ message, assistant }) => {
  const isUser = message.role === 'user'
  const { processedBlocks } = useMessageBlocks(message.id)

  const mediaBlocks = processedBlocks.filter(
    block => block.type === MessageBlockType.IMAGE || block.type === MessageBlockType.FILE
  )
  const contentBlocks = processedBlocks.filter(
    block => block.type !== MessageBlockType.IMAGE && block.type !== MessageBlockType.FILE
  )

  return (
    <View
      style={[isUser ? styles.userContainer : undefined, styles.container]}
      paddingHorizontal={14}
      borderRadius={16}>
      {mediaBlocks.length > 0 && <MessageBlockRenderer blocks={mediaBlocks} />}
      {contentBlocks.length > 0 && (
        <MessageContextMenu message={message} assistant={assistant}>
          <Stack
            style={[
              isUser ? styles.contentWrapper : undefined,
              isUser ? styles.userMessageContent : styles.assistantMessageContent,
              mediaBlocks.length > 0 && { marginTop: 8 }
            ]}
            borderRadius={16}
            backgroundColor={isUser ? '$green10' : '$green10'}
            borderColor={isUser ? '$green20' : '$colorTransparent'}
            borderWidth={1}>
            <MessageBlockRenderer blocks={contentBlocks} />
          </Stack>
        </MessageContextMenu>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%'
  },
  userContainer: {
    // alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },

  contentWrapper: {
    borderTopRightRadius: 8,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24
  },
  userMessageContent: {
    flex: 1,
    paddingHorizontal: 20
  },
  assistantMessageContent: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    maxWidth: '100%',
    width: '100%'
  }
})

export default React.memo(MessageContent)
