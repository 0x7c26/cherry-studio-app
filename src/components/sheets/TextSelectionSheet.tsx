import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import React, { forwardRef, useEffect } from 'react'
import { BackHandler, Platform } from 'react-native'
import { Text, useTheme } from 'tamagui'

interface TextSelectionSheetProps {
  content: string
}

const TextSelectionSheet = forwardRef<BottomSheetModal, TextSelectionSheetProps>(({ content }, ref) => {
  const theme = useTheme()

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

  useEffect(() => {
    if (Platform.OS !== 'android') return

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
      snapPoints={['80%']}
      ref={ref}
      enableDynamicSizing={false}
      handleIndicatorStyle={{
        backgroundColor: theme.color.val
      }}
      backdropComponent={renderBackdrop}>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 20 }}>
        <Text fontSize={16} color="$textPrimary" lineHeight={24} selectable={true} textBreakStrategy="balanced">
          {content}
        </Text>
      </BottomSheetScrollView>
    </BottomSheetModal>
  )
})

TextSelectionSheet.displayName = 'TextSelectionSheet'

export default TextSelectionSheet
