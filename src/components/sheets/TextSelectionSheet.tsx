import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { X } from '@tamagui/lucide-icons'
import React, { forwardRef, useImperativeHandle, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, TextInput, TouchableOpacity } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'

import { useTheme } from '@/hooks/useTheme'

interface TextSelectionSheetProps {
  content: string
}

export interface TextSelectionSheetRef {
  present: () => void
  dismiss: () => void
}

// TODO: 自定义选择后弹出的菜单
function SelectableText({ children }) {
  if (Platform.OS === 'ios') {
    return (
      <TextInput multiline editable={false} style={{ fontSize: 15, lineHeight: 24 }} scrollEnabled={false}>
        {children}
      </TextInput>
    )
  } else {
    return (
      <Text userSelect="all" fontSize={15} lineHeight={24}>
        {children}
      </Text>
    )
  }
}

const TextSelectionSheet = forwardRef<TextSelectionSheetRef, TextSelectionSheetProps>(({ content }, ref) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss()
  }))

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={['90%']}
      enableDynamicSizing={false}
      backgroundStyle={{
        borderRadius: 24,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? '#f9f9f9ff' : '#202020ff'
      }}
      backdropComponent={renderBackdrop}>
      <YStack flex={1}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={16}
          paddingBottom={16}
          borderBottomWidth={1}
          borderBottomColor="$borderColor">
          <Text fontSize={16} fontWeight="bold">
            {t('common.select_text')}
          </Text>
          <TouchableOpacity
            onPress={() => bottomSheetModalRef.current?.dismiss()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={20} />
          </TouchableOpacity>
        </XStack>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            paddingTop: 10
          }}>
          <SelectableText>{content}</SelectableText>
        </BottomSheetScrollView>
      </YStack>
    </BottomSheetModal>
  )
})

TextSelectionSheet.displayName = 'TextSelectionSheet'

export default TextSelectionSheet
