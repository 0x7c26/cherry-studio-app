import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { ChevronRight, Settings } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Button, Stack, styled, Text, View, XStack, YStack } from 'tamagui'

import { MenuTabContent } from '@/components/menu/MenuTabContent'
import { GroupedTopicList } from '@/components/topic/GroupTopicList'
import { useSettings } from '@/hooks/useSettings'
import { useTopics } from '@/hooks/useTopic'
import { haptic } from '@/utils/haptic'

import { MarketIcon } from '../icons/MarketIcon'
import { UnionIcon } from '../icons/UnionIcon'
import { SettingDivider } from '../settings'
import SafeAreaContainer from '../ui/SafeAreaContainer'

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation()
  const { avatar, userName } = useSettings()

  const { topics } = useTopics()

  const handleNavigateTopicScreen = () => {
    haptic(ImpactFeedbackStyle.Medium)
    props.navigation.navigate('Home', { screen: 'TopicScreen' })
  }

  const handleNavigateAssistantMarketScreen = () => {
    haptic(ImpactFeedbackStyle.Medium)
    props.navigation.navigate('Assistant', { screen: 'AssistantMarketScreen' })
  }

  const handleNavigateAssistantScreen = () => {
    haptic(ImpactFeedbackStyle.Medium)
    props.navigation.navigate('Assistant', { screen: 'AssistantScreen' })
  }

  const handleNavigateSettingsScreen = () => {
    haptic(ImpactFeedbackStyle.Medium)
    props.navigation.navigate('Home', { screen: 'SettingsScreen' })
  }

  const handleNavigateChatScreen = (topicId: string) => {
    haptic(ImpactFeedbackStyle.Medium)
    props.navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId: topicId } })
  }

  return (
    <SafeAreaContainer>
      <YStack gap={10} flex={1}>
        <YStack gap={10} paddingHorizontal={10}>
          <ListItem onPress={handleNavigateAssistantMarketScreen}>
            <XStack gap={10} alignItems="center" justifyContent="center">
              <MarketIcon size={20} />
              <Text fontSize={16} color="$textPrimary">
                {t('assistants.market.title')}
              </Text>
            </XStack>
            <ChevronRight size={20} color="$textPrimary" />
          </ListItem>

          <ListItem onPress={handleNavigateAssistantScreen}>
            <XStack gap={10} alignItems="center" justifyContent="center">
              <UnionIcon size={20} />
              <Text fontSize={16} color="$textPrimary">
                {t('assistants.market.my_assistant')}
              </Text>
            </XStack>
            <ChevronRight size={20} color="$textPrimary" />
          </ListItem>
          <Stack paddingVertical={5} paddingHorizontal={10}>
            <SettingDivider />
          </Stack>
        </YStack>

        <MenuTabContent title={t('menu.topic.recent')} onSeeAllPress={handleNavigateTopicScreen}>
          <View flex={1} minHeight={200}>
            {/* 只显示7条 */}
            {topics.length > 0 && (
              <GroupedTopicList
                topics={topics.slice(0, 10)}
                enableScroll={true}
                handleNavigateChatScreen={handleNavigateChatScreen}
              />
            )}
          </View>
        </MenuTabContent>
      </YStack>

      <Stack paddingHorizontal={20} paddingBottom={10}>
        <SettingDivider />
      </Stack>

      <XStack paddingHorizontal={20} justifyContent="space-between" alignItems="center">
        <XStack gap={10} alignItems="center">
          <Avatar circular size={48}>
            <Avatar.Image accessibilityLabel="Cam" src={avatar || require('@/assets/images/favicon.png')} />
            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
          </Avatar>
          <Text fontSize={16} color="$textPrimary">
            {userName || t('common.cherry_studio')}
          </Text>
        </XStack>
        <Button icon={<Settings size={24} color="$textPrimary" />} chromeless onPress={handleNavigateSettingsScreen} />
      </XStack>
    </SafeAreaContainer>
  )
}

const ListItem = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 9,
  pressStyle: { backgroundColor: '$gray20' }
})
