import React from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Pressable } from 'react-native'
import { Image, Text, YStack } from '@/componentsV2'

const WelcomeContent = () => {
  const { t } = useTranslation()

  return (
    <Pressable className="flex-1 justify-center items-center h-full w-full" onPress={() => Keyboard.dismiss()}>
      <YStack className="justify-center items-center">
        <Image
          source={require('@/assets/images/favicon.png')}
          className="w-[100px] h-[100px] rounded-lg overflow-hidden"
          resizeMode="contain"
        />
        <Text className="text-[18px] font-bold text-primary mt-5">{t('chat.title')}</Text>
      </YStack>
    </Pressable>
  )
}

export default WelcomeContent
