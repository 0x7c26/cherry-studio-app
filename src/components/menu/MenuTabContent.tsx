import React from 'react'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

interface MenuTabContentProps {
  title: string
  onSeeAllPress?: () => void
  children?: React.ReactNode
}

export function MenuTabContent({ title, onSeeAllPress, children }: MenuTabContentProps) {
  const { t } = useTranslation()

  return (
    <YStack flex={1} gap={10}>
      <YStack paddingHorizontal={20}>
        <XStack justifyContent="space-between" alignItems="center">
          <XStack paddingVertical={10} gap={8} alignItems="center">
            <Text>{title}</Text>
          </XStack>
          <TouchableOpacity onPress={onSeeAllPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text color="$textLink">{t('menu.see_all')}</Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
      {children}
    </YStack>
  )
}
