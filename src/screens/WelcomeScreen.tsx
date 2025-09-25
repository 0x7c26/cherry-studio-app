import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackActions, useNavigation } from '@react-navigation/native'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, TouchableOpacity, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { Button } from 'heroui-native'

import { Image, SafeAreaContainer, Text, XStack, YStack } from '@/componentsV2'
import { useAppDispatch } from '@/store'
import { setWelcomeShown } from '@/store/app'

const { width } = Dimensions.get('window')

const carouselItems = [
  {
    id: 1,
    title: '智能对话助手',
    description: '无论是解答问题、创作内容，还是头脑风暴，Cherry都能为你提供专业、准确的回应。',
    image: require('@/assets/images/welcome/1.webp')
  },
  {
    id: 2,
    title: 'AI图像创作',
    description: '只需简单描述，即可生成令人惊叹的图像。无论是写实风格还是艺术创作，都能满足你的想象。',
    image: require('@/assets/images/welcome/2.jpeg')
  },
  {
    id: 3,
    title: '多模态内容理解',
    description: '上传图片、文档或音频，Cherry能够理解并处理各种形式的内容，为你提供全面的分析和建议。',
    image: require('@/assets/images/welcome/3.jpeg')
  },
  {
    id: 4,
    title: '智能翻译引擎',
    description: '支持100多种语言的即时翻译，保留原文风格与意境，适用于日常对话、专业文档和文学作品。',
    image: require('@/assets/images/welcome/4.jpeg')
  },
  {
    id: 5,
    title: '隐私与安全',
    description: 'Cherry Studio严格保护你的隐私。你的数据完全加密，未经许可不会用于任何其他目的。',
    image: require('@/assets/images/welcome/5.webp')
  }
]

export default function WelcomeScreen() {
  const navigation = useNavigation()
  const dispatch = useAppDispatch()

  const [activeIndex, setActiveIndex] = useState(0)
  const pagerRef = useRef<PagerView>(null)
  // 为每个指示器创建动画值
  const [indicatorWidths] = useState(carouselItems.map((_, index) => new Animated.Value(index === 0 ? 24 : 8)))

  const handleStart = () => {
    navigation.dispatch(StackActions.replace('HomeScreen'))
    AsyncStorage.setItem('accessToken', 'true')
    dispatch(setWelcomeShown(true))
  }

  const handlePageSelected = (e: any) => {
    const position = e.nativeEvent.position
    setActiveIndex(position % carouselItems.length)

    // 更新所有指示器的宽度动画
    carouselItems.forEach((_, index) => {
      Animated.timing(indicatorWidths[index], {
        toValue: index === position % carouselItems.length ? 24 : 8,
        duration: 300,
        useNativeDriver: false
      }).start()
    })
  }

  // 添加点击指示器切换页面的函数
  const handleIndicatorPress = (index: number) => {
    if (pagerRef.current) {
      pagerRef.current.setPage(index)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (pagerRef.current) {
        const nextIndex = (activeIndex + 1) % carouselItems.length
        pagerRef.current.setPage(nextIndex)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [activeIndex])

  return (
    <SafeAreaContainer>
      <YStack className="flex-1 items-center justify-between py-5">
        <YStack className="items-center mt-5">
          <Image source={require('@/assets/images/favicon.png')} style={{ width: 60, height: 60, borderRadius: 15 }} />
          <Text className="text-2xl font-bold mt-4">
            欢迎来到 <Text className="text-purple-600">Cherry Studio</Text>
          </Text>
          <Text className="text-gray-400 text-base mt-1">探索AI创作的无限可能</Text>
        </YStack>

        <View className="flex-1 justify-center items-center w-full">
          <PagerView
            ref={pagerRef}
            style={{ width: width, height: width }}
            initialPage={0}
            onPageSelected={handlePageSelected}>
            {carouselItems.map(item => (
              <YStack key={item.id} className="items-center justify-center p-5">
                <Image source={item.image} style={{ width: width * 0.6, height: width * 0.6, resizeMode: 'contain' }} />
                <Text className="text-xl font-bold mt-5">{item.title}</Text>
                <Text className="text-gray-400 text-sm text-center mt-2 px-5">{item.description}</Text>
              </YStack>
            ))}
          </PagerView>
        </View>

        <XStack className="justify-center mb-7">
          {carouselItems.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => handleIndicatorPress(index)} activeOpacity={0.7}>
              <Animated.View
                style={{
                  width: indicatorWidths[index],
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                  backgroundColor: index === activeIndex ? '#9333EA' : '#D1D5DB'
                }}
              />
            </TouchableOpacity>
          ))}
        </XStack>

        <Button className="bg-purple-600 w-[90%] h-[50px] mb-4 rounded-[10px]" onPress={handleStart}>
          <Button.LabelContent>
            <Text className="text-white text-lg font-bold">立即开始</Text>
          </Button.LabelContent>
        </Button>

        <Text className="text-gray-400 text-xs text-center mb-2">
          点击&ldquo;立即开始&rdquo;，即表示你同意我们的服务条款和隐私政策
        </Text>
      </YStack>
    </SafeAreaContainer>
  )
}
