import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { SquareFunction, Wrench } from '@tamagui/lucide-icons'
import { t } from 'i18next'
import { forwardRef, useEffect } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Text, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'
import { Assistant } from '@/types/assistant'

interface ToolUseSheetProps {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => void
}

const toolUseOptions = [
  {
    id: 'function' as const,
    name: t('assistants.settings.tooluse.function'),
    icon: <SquareFunction size={20} />
  },
  {
    id: 'prompt' as const,
    name: t('assistants.settings.tooluse.prompt'),
    icon: <Wrench size={20} />
  }
]

const ToolUseSheet = forwardRef<BottomSheetModal, ToolUseSheetProps>(({ assistant, updateAssistant }, ref) => {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  const handleToolUseModeToggle = (mode: 'function' | 'prompt') => {
    const newToolUseMode = mode === assistant.settings?.toolUseMode ? undefined : mode
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        toolUseMode: newToolUseMode
      }
    })
  }

  // 处理Android返回按钮事件
  useEffect(() => {
    const backAction = () => {
      if ((ref as React.RefObject<BottomSheetModal>)?.current) {
        ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
        return true
      }

      return false
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)

    return () => backHandler.remove()
  }, [ref])

  return (
    <BottomSheetModal
      snapPoints={['25%']}
      enableDynamicSizing={true}
      ref={ref}
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}
      backdropComponent={renderBackdrop}>
      <BottomSheetView style={{ paddingBottom: insets.bottom }}>
        <YStack gap={5} paddingHorizontal={20} paddingBottom={20}>
          <YStack gap={5} padding="20">
            {toolUseOptions.map(option => (
              <Button
                key={option.id}
                onPress={() => handleToolUseModeToggle(option.id)}
                justifyContent="space-between"
                chromeless
                paddingHorizontal={8}
                paddingVertical={8}
                borderColor={assistant.settings?.toolUseMode === option.id ? '$green20' : 'transparent'}
                backgroundColor={assistant.settings?.toolUseMode === option.id ? '$green10' : 'transparent'}>
                <XStack gap={8} flex={1} alignItems="center" justifyContent="space-between" width="100%">
                  <XStack gap={8} flex={1} alignItems="center" maxWidth="80%">
                    {/* Tool use mode icon */}
                    <XStack justifyContent="center" alignItems="center" flexShrink={0}>
                      {option.icon}
                    </XStack>
                    {/* Tool use mode name */}
                    <Text numberOfLines={1} ellipsizeMode="tail" flex={1}>
                      {option.name}
                    </Text>
                  </XStack>
                  <XStack gap={8} alignItems="center" flexShrink={0}></XStack>
                </XStack>
              </Button>
            ))}
          </YStack>
        </YStack>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

export default ToolUseSheet
