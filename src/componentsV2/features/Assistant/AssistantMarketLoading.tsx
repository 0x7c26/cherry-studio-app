import { DrawerActions, useNavigation } from '@react-navigation/native'
import { ImpactFeedbackStyle } from 'expo-haptics'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { Spinner } from 'heroui-native'

import { SafeAreaContainer, HeaderBar, DrawerGestureWrapper } from '@/componentsV2'
import { Menu } from '@/componentsV2/icons/LucideIcon'
import { DrawerNavigationProps } from '@/types/naviagate'
import { haptic } from '@/utils/haptic'

export default function AssistantMarketLoading() {
  const { t } = useTranslation()
  const navigation = useNavigation<DrawerNavigationProps>()

  const handleMenuPress = () => {
    haptic(ImpactFeedbackStyle.Medium)
    navigation.dispatch(DrawerActions.openDrawer())
  }

  return (
    <SafeAreaContainer>
      <DrawerGestureWrapper>
        <View collapsable={false} style={{ flex: 1 }}>
          <HeaderBar
            title={t('assistants.market.title')}
            leftButton={{
              icon: <Menu className="w-6 h-6" />,
              onPress: handleMenuPress
            }}
          />
          <View className="justify-center items-center">
            <Spinner size="lg" />
          </View>
        </View>
      </DrawerGestureWrapper>
    </SafeAreaContainer>
  )
}
