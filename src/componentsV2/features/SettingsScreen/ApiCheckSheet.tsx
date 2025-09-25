import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import React, { forwardRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button, Spinner } from 'heroui-native'

import { useTheme } from '@/hooks/useTheme'
import { ApiStatus, Model } from '@/types/assistant'
import { getModelUniqId } from '@/utils/model'
import { ChevronsRight } from '@/componentsV2/icons'

import { ModelSelect } from './ModelSelect'
import YStack from '@/componentsV2/layout/YStack'
import XStack from '@/componentsV2/layout/XStack'
import Text from '@/componentsV2/base/Text'

interface ApiCheckSheetProps {
  selectedModel: Model | undefined
  onModelChange: (value: string) => void
  selectOptions: {
    label: string
    title: string
    options: {
      label: string
      value: string
      model: Model
    }[]
  }[]
  onStartModelCheck: () => void
  checkApiStatus: ApiStatus
}

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
)

export const ApiCheckSheet = forwardRef<BottomSheetModal, ApiCheckSheetProps>(
  ({ selectedModel, onModelChange, selectOptions, onStartModelCheck, checkApiStatus }, ref) => {
    const { t } = useTranslation()
    const { isDark } = useTheme()
    const insets = useSafeAreaInsets()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
      if (!isVisible) return

      const backAction = () => {
        ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
        return true
      }

      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
      return () => backHandler.remove()
    }, [ref, isVisible])

    return (
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        enableDynamicSizing={true}
        ref={ref}
        backgroundStyle={{
          borderRadius: 30,
          backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
        }}
        onDismiss={() => setIsVisible(false)}
        onChange={index => setIsVisible(index >= 0)}>
        <BottomSheetView style={{ paddingBottom: insets.bottom }}>
          <YStack className="items-center pt-2.5 pb-7 px-5 gap-2.5">
            <XStack className="w-full items-center justify-center">
              <Text className="text-2xl text-text-primary dark:text-text-primary-dark">
                {t('settings.provider.api_check.title')}
              </Text>
            </XStack>

            <YStack className="w-full gap-1.5">
              <Text className="text-text-primary dark:text-text-primary-dark">
                {t('settings.provider.api_check.tooltip')}
              </Text>
              <ModelSelect
                value={selectedModel ? getModelUniqId(selectedModel) : undefined}
                onValueChange={onModelChange}
                selectOptions={selectOptions}
                placeholder={t('settings.models.empty')}
              />
            </YStack>

            <XStack className="w-full items-center justify-center">
              <Button
                variant="tertiary"
                className="h-11 w-1/2 rounded-lg bg-green-10 border-green-20 dark:bg-green-dark-10 dark:border-green-dark-20"
                isDisabled={checkApiStatus === 'processing'}
                onPress={onStartModelCheck}>
                <Button.LabelContent>
                  {checkApiStatus === 'processing' && (
                    <View>
                      <XStack className="gap-2.5 w-full items-center justify-center">
                        <Spinner size="sm" color="success" />
                        <Text className="text-lg font-bold text-green-100 dark:text-green-dark-100">
                          {t('button.checking')}
                        </Text>
                      </XStack>
                    </View>
                  )}

                  {checkApiStatus === 'idle' && (
                    <View>
                      <XStack className="w-full items-center justify-between">
                        <Text className="text-lg font-bold text-green-100 dark:text-green-dark-100">
                          {t('button.start_check_model')}
                        </Text>
                        <ChevronsRight className="text-green-100 dark:text-green-dark-100" />
                      </XStack>
                    </View>
                  )}

                  {checkApiStatus === 'success' && (
                    <View>
                      <XStack className="w-full items-center justify-center">
                        <Text className="text-lg font-bold text-green-100 dark:text-green-dark-100">
                          {t('button.success')}
                        </Text>
                      </XStack>
                    </View>
                  )}
                </Button.LabelContent>
              </Button>
            </XStack>
          </YStack>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
)

ApiCheckSheet.displayName = 'ApiCheckSheet'
