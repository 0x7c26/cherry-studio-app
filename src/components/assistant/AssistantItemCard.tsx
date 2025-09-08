import React from 'react'
import { Dimensions } from 'react-native'
import { Text, View, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { Assistant } from '@/types/assistant'

import EmojiAvatar from './EmojiAvator'
import GroupTag from './market/GroupTag'

interface AssistantItemCardProps {
  assistant: Assistant
  onAssistantPress: (assistant: Assistant) => void
}

const AssistantItemCard = ({ assistant, onAssistantPress }: AssistantItemCardProps) => {
  const { isDark } = useTheme()

  // 计算卡片宽度和高度
  const screenWidth = Dimensions.get('window').width
  const horizontalPadding = 20 // 左右各10px的padding
  const columnGap = 8 // 列间距
  const cardWidth = (screenWidth - horizontalPadding * 2 - columnGap) / 2
  const cardHeight = cardWidth / 0.78 // 宽高比为0.78

  const handlePress = () => {
    onAssistantPress(assistant)
  }

  return (
    <View
      backgroundColor="$uiCardBackground"
      padding={14}
      width={cardWidth}
      height={cardHeight}
      borderRadius={16}
      onPress={handlePress}>
      <YStack gap={8} alignItems="center" height="100%">
        <EmojiAvatar
          emoji={assistant.emoji}
          size={cardWidth / 2}
          borderWidth={5}
          borderColor={isDark ? '#333333' : '$backgroundPrimary'}
        />
        <Text fontSize={16} textAlign="center" numberOfLines={1} ellipsizeMode="tail">
          {assistant.name}
        </Text>
        <View height={40}>
          <Text color="$textSecondary" fontSize={12} lineHeight={12} numberOfLines={3} ellipsizeMode="tail">
            {assistant.description}
          </Text>
        </View>
        <XStack gap={10}>
          {assistant.group &&
            assistant.group.map((group, index) => (
              <GroupTag
                key={index}
                group={group}
                fontSize={8}
                backgroundColor="$green10"
                color="$green100"
                borderWidth={0.5}
                borderColor="$green20"
              />
            ))}
        </XStack>
      </YStack>
    </View>
  )
}

export default AssistantItemCard
