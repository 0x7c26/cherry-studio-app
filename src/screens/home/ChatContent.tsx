import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { SafeAreaContainer } from '@/componentsV2'
import { useAssistant } from '@/hooks/useAssistant'
import { Topic } from '@/types/assistant'

import Messages from './messages/Messages'

interface ChatContentProps {
  topic: Topic
}

const ChatContent = ({ topic }: ChatContentProps) => {
  const { assistant, isLoading } = useAssistant(topic.assistantId)

  if (isLoading || !assistant) {
    return (
      <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaContainer>
    )
  }

  return (
    <View style={styles.container}>
      <Messages assistant={assistant} topic={topic} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%'
  }
})

export default ChatContent
