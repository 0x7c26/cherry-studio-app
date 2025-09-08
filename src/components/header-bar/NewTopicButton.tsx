import { useNavigation } from '@react-navigation/native'
import { MessageSquareDiff } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React from 'react'

import { createNewTopic, getNewestTopic } from '@/services/TopicService'
import { useAppDispatch } from '@/store'
import { setCurrentTopicId } from '@/store/topic'
import { Assistant } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { haptic } from '@/utils/haptic'

import { IconButton } from '../ui/IconButton'

interface NewTopicButtonProps {
  assistant: Assistant
}

export const NewTopicButton: React.FC<NewTopicButtonProps> = ({ assistant }) => {
  const navigation = useNavigation<DrawerNavigationProps>()
  const dispatch = useAppDispatch()

  const handleAddNewTopic = async () => {
    haptic(ImpactFeedbackStyle.Medium)
    const newestTopic = await getNewestTopic()

    if (newestTopic && newestTopic.messages.length === 0) {
      newestTopic.assistantId = assistant.id
      dispatch(setCurrentTopicId(newestTopic.id))
      navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId: newestTopic.id } })
    } else {
      const newTopic = await createNewTopic(assistant)
      dispatch(setCurrentTopicId(newTopic.id))
      navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId: newTopic.id } })
    }
  }

  return <IconButton onPress={handleAddNewTopic} icon={<MessageSquareDiff size={24} />} />
}
