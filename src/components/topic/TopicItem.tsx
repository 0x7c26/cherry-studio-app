import { useNavigation } from '@react-navigation/native'
import { Edit3, Trash2 } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import { FC, useEffect, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import * as ContextMenu from 'zeego/context-menu'

import i18n from '@/i18n'
import { getAssistantById } from '@/services/AssistantService'
import { useAppDispatch, useAppSelector } from '@/store'
import { setCurrentTopicId } from '@/store/topic'
import { Assistant, Topic } from '@/types/assistant'
import { DrawerNavigationProps } from '@/types/naviagate'
import { storage } from '@/utils'
import { haptic } from '@/utils/haptic'

import EmojiAvatar from '../assistant/EmojiAvator'

type TimeFormat = 'time' | 'date'

interface TopicItemProps {
  topic: Topic
  timeFormat?: TimeFormat
  onDelete?: (topicId: string) => Promise<void>
  onRename?: (topicId: string, newName: string) => Promise<void>
  handleNavigateChatScreen?: (topicId: string) => void
}

const TopicItem: FC<TopicItemProps> = ({
  topic,
  timeFormat = 'time',
  onDelete,
  onRename,
  handleNavigateChatScreen
}) => {
  const { t } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language)
  const dispatch = useAppDispatch()
  const navigation = useNavigation<DrawerNavigationProps>()
  const [assistant, setAssistant] = useState<Assistant>()

  const isActive = useAppSelector(state => state.topic.currentTopicId === topic.id)

  const openTopic = () => {
    dispatch(setCurrentTopicId(topic.id))

    if (handleNavigateChatScreen) {
      handleNavigateChatScreen(topic.id)
    } else {
      haptic(ImpactFeedbackStyle.Medium)
      navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId: topic.id } })
    }
  }

  const date = new Date(topic.updatedAt)
  const displayTime =
    timeFormat === 'date'
      ? date.toLocaleDateString(currentLanguage, {
          month: 'short',
          day: 'numeric'
        })
      : date.toLocaleTimeString(currentLanguage, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })

  useEffect(() => {
    const fetchCurrentLanguage = () => {
      const storedLanguage = storage.getString('language')

      if (storedLanguage) {
        setCurrentLanguage(storedLanguage)
      }
    }

    const fetchAssistant = async () => {
      setAssistant(await getAssistantById(topic.assistantId))
    }

    fetchCurrentLanguage()
    fetchAssistant()
  }, [topic.assistantId])

  const handleRename = () => {
    Alert.prompt(
      t('topics.rename.title'),
      '',
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.save'),
          onPress: async newName => {
            if (newName && newName.trim() && newName.trim() !== topic.name) {
              try {
                await onRename?.(topic.id, newName.trim())
              } catch (error) {
                Alert.alert(t('common.error_occurred'), (error as Error).message || 'Unknown error')
              }
            }
          }
        }
      ],
      'plain-text',
      topic.name
    )
  }

  return (
    <ContextMenu.Root
      // @ts-expect-error: https://github.com/nandorojo/zeego/issues/80
      __unsafeIosProps={{
        shouldWaitForMenuToHideBeforeFiringOnPressMenuItem: false
      }}>
      <ContextMenu.Trigger>
        <XStack
          onPress={openTopic}
          borderRadius={16}
          paddingVertical={5}
          paddingHorizontal={5}
          gap={14}
          justifyContent="center"
          alignItems="center"
          backgroundColor={isActive ? '$green10' : 'none'}
          pressStyle={{ backgroundColor: '$green20' }}>
          <EmojiAvatar
            emoji={assistant?.emoji}
            size={40}
            borderRadius={12}
            borderWidth={3}
            borderColor="$uiCardBackground"
          />
          <YStack flex={1}>
            <XStack justifyContent="space-between">
              <Text fontWeight="bold" color="$textPrimary">
                {assistant?.name}
              </Text>
              <Text fontSize={12} color="$textSecondary">
                {displayTime}
              </Text>
            </XStack>
            <Text fontSize={12} numberOfLines={1} ellipsizeMode="tail" fontWeight="400" color="$textPrimary">
              {topic.name}
            </Text>
          </YStack>
        </XStack>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item key="rename" onSelect={handleRename}>
          <ContextMenu.ItemTitle>{t('common.rename')}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'rectangle.and.pencil.and.ellipsis' }}>
            <Edit3 size={16} color="$textPrimary" />
          </ContextMenu.ItemIcon>
        </ContextMenu.Item>
        <ContextMenu.Item key="delete" destructive onSelect={async () => await onDelete?.(topic.id)}>
          <ContextMenu.ItemTitle>{t('common.delete')}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'trash' }}>
            <Trash2 size={16} color="red" />
          </ContextMenu.ItemIcon>
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}

export default TopicItem
