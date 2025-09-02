import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { AudioLines, CirclePause, Copy, MoreHorizontal, RefreshCw } from '@tamagui/lucide-icons'
import React, { useRef } from 'react'
import { Button, View, XStack } from 'tamagui'

import { useMessageActions } from '@/hooks/useMessageActions'
import { Assistant } from '@/types/assistant'
import { Message } from '@/types/message'

import MessageFooterMoreSheet from './MessageFooterMoreSheet'

interface MessageFooterProps {
  assistant: Assistant
  message: Message
}

const MessageFooter = ({ message, assistant }: MessageFooterProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const { playState, handleCopy, handleRegenerate, handlePlay } = useMessageActions({ message, assistant })

  const getAudioIcon = () => {
    switch (playState) {
      case 'playing':
        return <CirclePause size={18} />
      default:
        return <AudioLines size={18} />
    }
  }

  return (
    <View paddingHorizontal={14}>
      <XStack gap={20}>
        <Button chromeless circular size={24} icon={<Copy size={18} />} onPress={handleCopy}></Button>
        <Button chromeless circular size={24} icon={<RefreshCw size={18} />} onPress={handleRegenerate}></Button>
        <Button chromeless circular size={24} icon={getAudioIcon()} onPress={handlePlay}></Button>
        <Button
          chromeless
          circular
          size={24}
          icon={<MoreHorizontal size={18} />}
          onPress={() => {
            bottomSheetModalRef.current?.present()
          }}></Button>
      </XStack>
      <MessageFooterMoreSheet ref={bottomSheetModalRef} message={message} />
    </View>
  )
}

export default MessageFooter
