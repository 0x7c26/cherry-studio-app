import { useNavigation } from '@react-navigation/native'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { SettingContainer } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { defaultLanguage, languagesOptions } from '@/config/languages'
import { useBuiltInAssistants } from '@/hooks/useAssistant'
import { GeneralSettingsNavigationProps } from '@/types/naviagate'
import { storage } from '@/utils'

export default function LanguageChangeScreen() {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation<GeneralSettingsNavigationProps>()
  const [currentLanguage, setCurrentLanguage] = useState<string>(storage.getString('language') || defaultLanguage)
  const { resetBuiltInAssistants } = useBuiltInAssistants()

  const changeLanguage = async (langCode: string) => {
    storage.set('language', langCode)
    await i18n.changeLanguage(langCode)
    setCurrentLanguage(langCode)
    navigation.goBack()
  }

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode)
    resetBuiltInAssistants()
  }

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <HeaderBar title={t('settings.general.language.title')} />
      <SettingContainer>
        <YStack flex={1} gap={12} paddingHorizontal={16}>
          {languagesOptions.map(opt => (
            <XStack
              key={opt.value}
              onPress={() => handleLanguageChange(opt.value)}
              alignItems="center"
              justifyContent="space-between"
              padding={16}
              borderRadius={8}
              backgroundColor="$uiCardBackground"
              pressStyle={{ opacity: 0.7 }}>
              <XStack alignItems="center" space>
                <Text fontSize={16}>{opt.flag}</Text>
                <Text fontSize={16}>{opt.label}</Text>
              </XStack>

              <XStack
                width={20}
                height={20}
                borderRadius={10}
                borderWidth={2}
                borderColor={currentLanguage === opt.value ? '$textPrimary' : '$textSecondary'}
                alignItems="center"
                justifyContent="center">
                {currentLanguage === opt.value && (
                  <XStack width={10} height={10} borderRadius={5} backgroundColor="$textPrimary" />
                )}
              </XStack>
            </XStack>
          ))}
        </YStack>
      </SettingContainer>
    </SafeAreaContainer>
  )
}
