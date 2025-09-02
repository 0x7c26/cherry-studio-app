import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { AudioLines, CirclePause, Copy, RefreshCw, TextSelect, Trash2 } from '@tamagui/lucide-icons'
import { FC, memo, useEffect, useRef, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import * as ContextMenu from 'zeego/context-menu'

import { TranslatedIcon, TranslationIcon } from '@/components/icons/TranslationIcon'
import TextSelectionSheet from '@/components/sheets/TextSelectionSheet'
import { useMessageActions } from '@/hooks/useMessageActions'
import { Assistant } from '@/types/assistant'
import { Message } from '@/types/message'

interface MessageItemProps {
  children: React.ReactNode
  message: Message
  assistant?: Assistant
}

const MessageContextMenu: FC<MessageItemProps> = ({ children, message, assistant }) => {
  const { t } = useTranslation()
  const textSelectionSheetRef = useRef<BottomSheetModal>(null)
  const [messageContent, setMessageContent] = useState('')

  const {
    playState,
    isTranslated,
    handleCopy,
    handleDelete,
    handleRegenerate,
    handlePlay,
    handleTranslate,
    handleDeleteTranslation,
    getMessageContent
  } = useMessageActions({ message, assistant })

  const handleSelectText = async () => {
    requestAnimationFrame(() => {
      textSelectionSheetRef.current?.present()
    })
  }

  const getAudioIcon = () => {
    switch (playState) {
      case 'playing':
        return <CirclePause size={16} />
      default:
        return <AudioLines size={16} />
    }
  }

  useEffect(() => {
    getMessageContent().then(setMessageContent)
  }, [message, getMessageContent])

  return (
    <>
      <ContextMenu.Root
        // @ts-expect-error: https://github.com/nandorojo/zeego/issues/80
        __unsafeIosProps={{
          shouldWaitForMenuToHideBeforeFiringOnPressMenuItem: false
        }}>
        <ContextMenu.Trigger>{children}</ContextMenu.Trigger>
        <ContextMenu.Content>
          <ContextMenu.Item key="select_text" onSelect={handleSelectText}>
            <ContextMenu.ItemTitle>{t('common.select_text')}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'character.cursor.ibeam' }}>
              <TextSelect size={16} />
            </ContextMenu.ItemIcon>
          </ContextMenu.Item>
          <ContextMenu.Item key="copy" onSelect={handleCopy}>
            <ContextMenu.ItemTitle>{t('common.copy')}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'document.on.document' }}>
              <Copy size={16} />
            </ContextMenu.ItemIcon>
          </ContextMenu.Item>
          <ContextMenu.Item key="regenerate" onSelect={handleRegenerate} hidden={message.role !== 'assistant'}>
            <ContextMenu.ItemTitle>{t('common.regenerate')}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'arrow.clockwise' }}>
              <RefreshCw size={16} />
            </ContextMenu.ItemIcon>
          </ContextMenu.Item>
          <ContextMenu.Item key="play" onSelect={handlePlay}>
            <ContextMenu.ItemTitle>
              {playState === 'playing' ? t('common.stop') : t('common.play')}
            </ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: playState === 'playing' ? 'pause.circle' : 'speaker.wave.2' }}>
              {getAudioIcon()}
            </ContextMenu.ItemIcon>
          </ContextMenu.Item>
          <ContextMenu.Item
            key="translate"
            onSelect={isTranslated ? handleDeleteTranslation : handleTranslate}
            destructive={isTranslated}>
            <ContextMenu.ItemTitle>
              {isTranslated ? t('common.delete_translation') : t('common.translate')}
            </ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: isTranslated ? 'translate' : 'translate' }}>
              {isTranslated ? <TranslatedIcon size={16} /> : <TranslationIcon size={16} />}
            </ContextMenu.ItemIcon>
          </ContextMenu.Item>
          <ContextMenu.Item key="delete" onSelect={handleDelete} destructive>
            <ContextMenu.ItemTitle>{t('common.delete')}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'trash' }}>
              <Trash2 size={16} color="red" />
            </ContextMenu.ItemIcon>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Root>

      <TextSelectionSheet ref={textSelectionSheetRef} content={messageContent} />
    </>
  )
}

export default memo(MessageContextMenu)
