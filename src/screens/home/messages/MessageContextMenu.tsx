import { AudioLines, CirclePause, Copy, RefreshCw, TextSelect, Trash2 } from '@tamagui/lucide-icons'
import { FC, memo, useEffect, useRef, useState } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { TranslatedIcon, TranslationIcon } from '@/components/icons/TranslationIcon'
import TextSelectionSheet, { TextSelectionSheetRef } from '@/components/sheets/TextSelectionSheet'
import ContextMenu, { ContextMenuListProps } from '@/components/ui/ContextMenu'
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
  const textSelectionSheetRef = useRef<TextSelectionSheetRef>(null)
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

  const contextMenuItems: ContextMenuListProps[] = [
    {
      title: t('common.select_text'),
      iOSIcon: 'character.cursor.ibeam',
      androidIcon: <TextSelect size={16} color="$textPrimary" />,
      onSelect: handleSelectText
    },
    {
      title: t('common.copy'),
      iOSIcon: 'document.on.document',
      androidIcon: <Copy size={16} color="$textPrimary" />,
      onSelect: handleCopy
    },
    ...(message.role === 'assistant'
      ? [
          {
            title: t('common.regenerate'),
            iOSIcon: 'arrow.clockwise' as const,
            androidIcon: <RefreshCw size={16} color="$textPrimary" />,
            onSelect: handleRegenerate
          }
        ]
      : []),
    {
      title: playState === 'playing' ? t('common.stop') : t('common.play'),
      iOSIcon: playState === 'playing' ? 'pause.circle' : 'speaker.wave.2',
      androidIcon: getAudioIcon(),
      onSelect: handlePlay
    },
    {
      title: isTranslated ? t('common.delete_translation') : t('message.translate_message'),
      iOSIcon: 'translate',
      androidIcon: isTranslated ? (
        <TranslatedIcon size={16} color={isTranslated ? 'red' : '$textPrimary'} />
      ) : (
        <TranslationIcon size={16} color="$textPrimary" />
      ),
      destructive: isTranslated,
      color: isTranslated ? 'red' : undefined,
      onSelect: isTranslated ? handleDeleteTranslation : handleTranslate
    },
    {
      title: t('message.delete_message'),
      iOSIcon: 'trash',
      androidIcon: <Trash2 size={16} color="red" />,
      destructive: true,
      color: 'red',
      onSelect: handleDelete
    }
  ]

  return (
    <>
      <ContextMenu list={contextMenuItems} activeOpacity={1}>{children}</ContextMenu>

      <TextSelectionSheet ref={textSelectionSheetRef} content={messageContent} />
    </>
  )
}

export default memo(MessageContextMenu)
