import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { ChevronRight } from '@tamagui/lucide-icons'
import { useCallback, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack, YStack } from 'tamagui'

import { PressableSettingRow, SettingContainer, SettingGroup, SettingGroupTitle } from '@/components/settings'
import { HeaderBar } from '@/components/settings/HeaderBar'
import SafeAreaContainer from '@/components/ui/SafeAreaContainer'
import { languagesOptions } from '@/config/languages'
import { useTheme } from '@/hooks/useTheme'
import { GeneralSettingsNavigationProps } from '@/types/naviagate'
import { storage } from '@/utils'

export default function GeneralSettingsScreen() {
  const { t, i18n } = useTranslation()

  const [language, setLanguage] = useState('zh-CN')
  const { activeTheme } = useTheme()

  const navigation = useNavigation<GeneralSettingsNavigationProps>()

  const handleFocus = useCallback(() => {
    const loadSettings = async () => {
      const storedLanguage = storage.getString('language')

      if (storedLanguage) {
        setLanguage(storedLanguage)
      } else {
        setLanguage(i18n.language)
      }
    }

    loadSettings()
  }, [i18n.language])

  useFocusEffect(handleFocus)

  const getCurrentLanguage = () => {
    const currentLang = languagesOptions.find(item => item.value === language)
    return currentLang ? `${currentLang.flag} ${currentLang.label}` : 'English'
  }

  return (
    <SafeAreaContainer style={{ flex: 1 }}>
      <HeaderBar title={t('settings.general.title')} />
      <SettingContainer>
        <YStack gap={24} flex={1}>
          {/* Display settings */}
          <YStack gap={8}>
            <SettingGroupTitle>{t('settings.general.display.title')}</SettingGroupTitle>
            <SettingGroup>
              <PressableSettingRow onPress={() => navigation.navigate('ThemeSettingsScreen')}>
                <XStack alignItems="center">
                  <Text fontSize="$5">{t('settings.general.theme.title')}</Text>
                </XStack>
                <XStack alignItems="center" space="$2">
                  <Text color="$colorFocus">{t(`settings.general.theme.${activeTheme}`)}</Text>
                  <ChevronRight size={24} color="$colorFocus" />
                </XStack>
              </PressableSettingRow>
            </SettingGroup>
          </YStack>

          {/* General settings */}
          <YStack gap={8}>
            <SettingGroupTitle>{t('settings.general.title')}</SettingGroupTitle>
            <SettingGroup>
              <PressableSettingRow onPress={() => navigation.navigate('LanguageChangeScreen')}>
                <XStack alignItems="center">
                  <Text fontSize="$5">{t('settings.general.language.title')}</Text>
                </XStack>
                <XStack alignItems="center" space="$2">
                  <Text color="$colorFocus">{getCurrentLanguage()}</Text>
                  <ChevronRight size={24} color="$colorFocus" />
                </XStack>
              </PressableSettingRow>
            </SettingGroup>
          </YStack>

          {/* Privacy settings */}
          {/*<YStack gap={8}>
            <SettingGroupTitle>{t('settings.general.display.title')}</SettingGroupTitle>
            <SettingGroup>
              <SettingRow>
                <XStack alignItems="center">
                  <Text fontSize="$5">{t('settings.general.privacy.anonymous')}</Text>
                </XStack>
                <CustomSwitch />
              </SettingRow>
            </SettingGroup>
          </YStack>*/}
        </YStack>
      </SettingContainer>
    </SafeAreaContainer>
  )
}
