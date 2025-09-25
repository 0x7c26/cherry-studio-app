import { DrawerNavigationProp } from '@react-navigation/drawer'
import { DrawerActions, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { ImpactFeedbackStyle } from 'expo-haptics'
import * as React from 'react'
import { useCallback, useEffect } from 'react'
import { ActivityIndicator, Platform, View } from 'react-native'
import { PanGestureHandler, State } from 'react-native-gesture-handler'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useDispatch } from 'react-redux'
import { YStack, SafeAreaContainer, MessageInput } from '@/componentsV2'

import { useBottom } from '@/hooks/useBottom'
import { useTopic } from '@/hooks/useTopic'
import { HomeStackParamList } from '@/navigators/HomeStackNavigator'
import { getDefaultAssistant } from '@/services/AssistantService'
import { loggerService } from '@/services/LoggerService'
import { createNewTopic, getNewestTopic } from '@/services/TopicService'
import { useAppSelector } from '@/store'
import { setCurrentTopicId } from '@/store/topic'
import { haptic } from '@/utils/haptic'

import ChatContent from './ChatContent'
import WelcomeContent from './WelcomeContent'
import { ChatScreenHeader } from '@/componentsV2/features/ChatScreen/Header'

const logger = loggerService.withContext('ChatScreen')

type ChatScreenRouteProp = RouteProp<HomeStackParamList, 'ChatScreen'>

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>()
  const navigation = useNavigation<DrawerNavigationProp<any>>()
  const currentTopicId = useAppSelector(state => state.topic.currentTopicId)
  const topicId = route.params?.topicId || currentTopicId
  const { topic, isLoading } = useTopic(topicId)
  const dispatch = useDispatch()
  const specificBottom = useBottom()

  const initializeTopic = useCallback(async () => {
    try {
      logger.verbose('Initializing topic', { topicId })

      const newestTopic = await getNewestTopic()

      if (newestTopic) {
        logger.info('Found existing newest topic', { topicId: newestTopic.id })
        navigation.setParams({ topicId: newestTopic.id })
      } else {
        logger.info('Creating new topic with default assistant')
        const defaultAssistant = await getDefaultAssistant()
        const newTopic = await createNewTopic(defaultAssistant)
        navigation.setParams({ topicId: newTopic.id })
        dispatch(setCurrentTopicId(newTopic.id))
        logger.info('New topic created', { topicId: newTopic.id })
      }
    } catch (error) {
      logger.error('Failed to initialize topic', error, { topicId })
    }
  }, [topicId, navigation, dispatch])

  useEffect(() => {
    // Only initialize if topicId indicates a new or missing topic
    // 1. 'new' -> explicit new topic request
    // 2. undefined -> after deleting all topics
    // 3. '' -> initial state when topics are empty
    const shouldInitialize = topicId === 'new' || topicId === undefined || topicId === ''

    if (shouldInitialize) {
      initializeTopic()
    }
  }, [topicId, initializeTopic])

  // 处理侧滑手势
  const handleSwipeGesture = (event: any) => {
    const { translationX, velocityX, state } = event.nativeEvent

    // 检测向右滑动
    if (state === State.END) {
      // 全屏可侧滑触发：滑动距离大于20且速度大于100，或者滑动距离大于80
      const hasGoodDistance = translationX > 20
      const hasGoodVelocity = velocityX > 100
      const hasExcellentDistance = translationX > 80

      if ((hasGoodDistance && hasGoodVelocity) || hasExcellentDistance) {
        haptic(ImpactFeedbackStyle.Medium)
        navigation.dispatch(DrawerActions.openDrawer())
      }
    }
  }

  if (!topic || isLoading) {
    return (
      <SafeAreaContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </SafeAreaContainer>
    )
  }

  const hasMessage = topic.messages.length > 0

  return (
    <SafeAreaContainer style={{ paddingBottom: 0 }}>
      <PanGestureHandler
        onGestureEvent={handleSwipeGesture}
        onHandlerStateChange={handleSwipeGesture}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -20 : -specificBottom}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <YStack className="flex-1">
            <ChatScreenHeader topic={topic} />

            <View
              style={{
                flex: 1
              }}>
              {/* ChatContent use key to re-render screen content */}
              {/* if remove key, change topic will not re-render */}
              {!hasMessage ? <WelcomeContent /> : <ChatContent key={topic.id} topic={topic} />}
            </View>
            <MessageInput topic={topic} />
          </YStack>
        </KeyboardAvoidingView>
      </PanGestureHandler>
    </SafeAreaContainer>
  )
}

export default ChatScreen
