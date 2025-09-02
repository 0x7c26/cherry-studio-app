import { FC } from 'react'
import React from 'react'
import { View } from 'tamagui'

import { Assistant } from '@/types/assistant'
import { AssistantMessageStatus, GroupedMessage } from '@/types/message'

import MessageItem from './Message'
import MessageFooter from './MessageFooter'
import MultiModelTab from './MultiModelTab'

interface MessageGroupProps {
  assistant: Assistant
  item: [string, GroupedMessage[]]
}

const MessageGroup: FC<MessageGroupProps> = ({ assistant, item }) => {
  const [key, messagesInGroup] = item

  const renderUserMessage = () => {
    return <MessageItem message={messagesInGroup[0]} assistant={assistant} />
  }

  const renderAssistantMessages = () => {
    if (messagesInGroup.length === 1) {
      return (
        <View gap={10}>
          {/*<MessageHeader assistant={assistant} message={messagesInGroup[0]} />*/}
          <MessageItem message={messagesInGroup[0]} assistant={assistant} />
          {/* 输出过程中不显示footer */}
          {messagesInGroup[0].status !== AssistantMessageStatus.PROCESSING && (
            <MessageFooter assistant={assistant} message={messagesInGroup[0]} />
          )}
        </View>
      )
    }

    return (
      <View gap={10}>
        {/*<MessageHeader assistant={assistant} message={messagesInGroup[0]} />*/}
        <MultiModelTab assistant={assistant} messages={messagesInGroup} />
      </View>
    )
  }

  return (
    <View>
      {key.includes('user') && renderUserMessage()}
      {key.includes('assistant') && renderAssistantMessages()}
    </View>
  )
}

export default MessageGroup
