import { MotiView } from 'moti'
import React, { FC, useState } from 'react'
import { ScrollView, Tabs, Text, View, XStack } from 'tamagui'

import { MultiModalIcon } from '@/components/icons/MultiModelIcon'
import { Assistant } from '@/types/assistant'
import { AssistantMessageStatus, GroupedMessage } from '@/types/message'

import MessageItem from './Message'
import MessageFooter from './MessageFooter'

interface MultiModelTabProps {
  assistant: Assistant
  messages: GroupedMessage[]
}

const MultiModelTab: FC<MultiModelTabProps> = ({ assistant, messages }) => {
  const [currentTab, setCurrentTab] = useState('0')

  if (!messages || messages.length === 0) {
    return null
  }

  return (
    <View>
      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        gap={10}>
        <Tabs.List>
          <XStack flex={1} gap={8} justifyContent="center" alignItems="center" paddingHorizontal={14}>
            <MultiModalIcon size={18} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap={5}>
                {messages.map((_message, index) => {
                  const tabValue = index.toString()
                  return (
                    <Tabs.Tab
                      key={tabValue}
                      value={tabValue}
                      paddingHorizontal={10}
                      paddingVertical={3}
                      borderRadius={48}
                      justifyContent="center"
                      alignItems="center"
                      height={26}>
                      <Text
                        fontSize={12}
                        lineHeight={17}
                        color={currentTab === tabValue ? '$green100' : '$textPrimary'}>
                        @{_message.model?.name}({_message.model?.provider})
                      </Text>
                    </Tabs.Tab>
                  )
                })}
              </XStack>
            </ScrollView>
          </XStack>
        </Tabs.List>

        {messages.map((message, index) => (
          <Tabs.Content key={index} value={index.toString()}>
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{
                translateY: 0,
                opacity: 1
              }}
              exit={{ opacity: 1, translateY: -10 }}
              transition={{
                type: 'timing'
              }}>
              <MessageItem message={message} assistant={assistant} />
              {/* 输出过程中不显示footer */}
              {message.status !== AssistantMessageStatus.PROCESSING && (
                <MessageFooter assistant={assistant} message={message} />
              )}
            </MotiView>
          </Tabs.Content>
        ))}
      </Tabs>
    </View>
  )
}

export default MultiModelTab
