import { DrawerActions, useNavigation } from '@react-navigation/native'
import { Menu, PenSquare } from '@tamagui/lucide-icons'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import { YStack } from 'tamagui'

import { HeaderBar } from '@/components/settings/HeaderBar'
import { GroupedTopicList } from '@/components/topic/GroupTopicList'
import { DrawerGestureWrapper } from '@/components/ui/DrawerGestureWrapper'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { SearchInput } from '@/components/ui/SearchInput'
import { useSearch } from '@/hooks/useSearch'
import { useTopics } from '@/hooks/useTopic'
import { getDefaultAssistant } from '@/services/AssistantService'
import { createNewTopic } from '@/services/TopicService'
import { DrawerNavigationProps } from '@/types/naviagate'
import { haptic } from '@/utils/haptic'

export default function TopicScreen() {
  const { t } = useTranslation()
  const navigation = useNavigation<DrawerNavigationProps>()
  const { topics, isLoading } = useTopics()

  const {
    searchText,
    setSearchText,
    filteredItems: filteredTopics
  } = useSearch(
    topics,
    useCallback(topic => [topic.name], []),
    { delay: 300 }
  )

  const handleAddNewTopic = async () => {
    const defaultAssistant = await getDefaultAssistant()
    const newTopic = await createNewTopic(defaultAssistant)
    navigation.navigate('Home', { screen: 'ChatScreen', params: { topicId: newTopic.id } })
  }

  const handleMenuPress = () => {
    haptic(ImpactFeedbackStyle.Medium)
    navigation.dispatch(DrawerActions.openDrawer())
  }

  if (isLoading) {
    return (
      <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <DrawerGestureWrapper>
          <View collapsable={false} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
          </View>
        </DrawerGestureWrapper>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <DrawerGestureWrapper>
        <View collapsable={false} style={{ flex: 1 }}>
          <HeaderBar
            title={t('topics.title.recent')}
            leftButton={{
              icon: <Menu size={24} />,
              onPress: handleMenuPress
            }}
            rightButton={{
              icon: <PenSquare size={24} />,
              onPress: handleAddNewTopic
            }}
          />
          <YStack flex={1} gap={15}>
            <View style={{ paddingHorizontal: 20 }}>
              <SearchInput
                placeholder={t('common.search_placeholder')}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>
            <GroupedTopicList topics={filteredTopics} enableScroll={true} />
          </YStack>
        </View>
      </DrawerGestureWrapper>
    </SafeAreaContainer>
  )
}
