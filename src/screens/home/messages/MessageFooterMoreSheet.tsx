import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { Trash2 } from '@tamagui/lucide-icons'
import React, { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler } from 'react-native'
import { Button, useTheme, YStack } from 'tamagui'

import { TranslatedIcon, TranslationIcon } from '@/components/icons/TranslationIcon'
import { useMessageActions } from '@/hooks/useMessageActions'
import { useTheme as useCustomTheme } from '@/hooks/useTheme'
import { Message } from '@/types/message'

interface MessageFooterMoreProps {
  message: Message
}

const MessageFooterMoreSheet = forwardRef<BottomSheetModal, MessageFooterMoreProps>(({ message }, ref) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { isDark } = useCustomTheme()
  const { isTranslated, handleTranslate, handleDeleteTranslation, handleDelete } = useMessageActions({ message })

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
  )

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

  const onTranslate = async () => {
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    await handleTranslate()
  }

  const onDeleteTranslation = async () => {
    await handleDeleteTranslation()
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
  }

  const onDelete = async () => {
    ;(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss()
    await handleDelete()
  }

  return (
    <BottomSheetModal
      snapPoints={['20%']}
      ref={ref}
      enableDynamicSizing={true}
      backgroundStyle={{
        borderRadius: 30,
        backgroundColor: isDark ? '#121213ff' : '#f7f7f7ff'
      }}
      handleIndicatorStyle={{
        backgroundColor: theme.color.val
      }}
      backdropComponent={renderBackdrop}>
      <BottomSheetView>
        <YStack alignItems="center" paddingTop={10} paddingBottom={30} paddingHorizontal={20} gap={10}>
          <YStack width="100%" gap={10}>
            <Button
              onPress={isTranslated ? onDeleteTranslation : onTranslate}
              icon={isTranslated ? <TranslatedIcon size={18} /> : <TranslationIcon size={18} />}
              justifyContent="flex-start">
              {isTranslated ? t('message.delete_translation') : t('message.translate_message')}
            </Button>
            {/*<Button icon={<FolderDown size={18} />} justifyContent="flex-start">*/}
            {/*  {t('export.title')}*/}
            {/*</Button>*/}
            <Button onPress={onDelete} icon={<Trash2 size={18} />} color="red" justifyContent="flex-start">
              {t('message.delete_message')}
            </Button>
          </YStack>
        </YStack>
      </BottomSheetView>
    </BottomSheetModal>
  )
})

MessageFooterMoreSheet.displayName = 'MessageFooterMoreSheet'

export default MessageFooterMoreSheet
