import { ChevronsRight } from '@tamagui/lucide-icons'
import { AnimatePresence, MotiView } from 'moti'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner, Text, XStack, YStack } from 'tamagui'

import { MessageBlockStatus, ThinkingMessageBlock } from '@/types/message'

interface Props {
  block: ThinkingMessageBlock
  expanded: boolean
}

const MarqueeComponent: React.FC<Props> = ({ block, expanded }) => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<string[]>([])
  const queueRef = useRef<string>('')
  const processedLengthRef = useRef(0)

  const isStreaming = block.status === MessageBlockStatus.STREAMING

  const animationFrameIdRef = useRef<number | null>(null)
  const clearAnimationFrame = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }
  }, [])

  const NEXT_CONTENT_COUNT = 50
  const startOutputQueue = useCallback(() => {
    if (processedLengthRef.current === 0) return

    const outputNextChar = () => {
      if (queueRef.current.length > NEXT_CONTENT_COUNT) {
        const nextContent = queueRef.current.slice(0, NEXT_CONTENT_COUNT).replace(/[\r\n]+/g, ' ')
        queueRef.current = queueRef.current.slice(NEXT_CONTENT_COUNT)

        setMessages(prev => [...prev, nextContent])
        animationFrameIdRef.current = requestAnimationFrame(outputNextChar)
      } else {
        clearAnimationFrame()
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(outputNextChar)
  }, [clearAnimationFrame])

  useEffect(() => {
    const content = block.content || ''

    if (isStreaming && content && content.length > processedLengthRef.current) {
      const newChars = content.slice(processedLengthRef.current)
      queueRef.current += newChars
      processedLengthRef.current = content.length
      startOutputQueue()
    }
  }, [block.content, isStreaming, startOutputQueue])

  useEffect(() => {
    return () => {
      clearAnimationFrame()
      queueRef.current = ''
      processedLengthRef.current = 0
    }
  }, [clearAnimationFrame])

  const lineHeight = 16
  const containerHeight = useMemo(() => {
    if (!isStreaming && !expanded) return 40
    if (expanded) return lineHeight
    return Math.min(64, Math.max(messages.length + 1, 2) * lineHeight)
  }, [expanded, isStreaming, messages.length])

  return (
    <MotiView
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '100%'
      }}
      animate={{
        height: containerHeight
      }}
      transition={{
        type: 'timing',
        duration: 50
      }}>
      <AnimatePresence>
        {isStreaming && (
          <MotiView
            key="spinner"
            from={{ width: 0, height: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: 20, height: 20, opacity: 1, marginRight: 10 }}
            exit={{ width: 0, height: 0, opacity: 0, marginRight: 0 }}
            transition={{ type: 'timing', duration: 150 }}>
            <Spinner size="small" color="$colorBrand" />
          </MotiView>
        )}
      </AnimatePresence>
      <YStack gap={5} flex={1} position="relative" height="100%">
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$textPrimary" fontWeight="bold" zIndex={2}>
            {t('chat.think', { seconds: Math.floor((block.thinking_millsec || 0) / 1000) })}
          </Text>
          <MotiView
            animate={{
              rotate: expanded ? '90deg' : '0deg'
            }}
            transition={{
              type: 'timing',
              duration: 150
            }}
            style={{ zIndex: 2 }}>
            <ChevronsRight size={20} />
          </MotiView>
        </XStack>
        <AnimatePresence>
          {!isStreaming && !expanded && (
            <MotiView
              key="tips"
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0
              }}
              transition={{
                type: 'timing',
                duration: 50
              }}>
              <Text color="$textSecondary" fontSize={12} opacity={0.5}>
                {t('chat.think_expand')}
              </Text>
            </MotiView>
          )}
          {isStreaming && !expanded && messages.length > 0 && (
            <MotiView
              style={{ position: 'absolute', inset: 0 }}
              key="content"
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0
              }}
              transition={{
                type: 'timing',
                duration: 50
              }}>
              {messages.map((message, index) => {
                const finalY = containerHeight - (messages.length - index) * lineHeight - 4

                if (index < messages.length - 4) return null

                const opacity = (() => {
                  const distanceFromLast = messages.length - 1 - index
                  if (distanceFromLast === 0) return 1
                  if (distanceFromLast === 1) return 0.7
                  if (distanceFromLast === 2) return 0.4
                  return 0.05
                })()

                return (
                  <MotiView
                    key={`${index}-${message}`}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: lineHeight
                    }}
                    from={{
                      opacity: index === messages.length - 1 ? 0 : 1,
                      translateY: index === messages.length - 1 ? containerHeight : finalY + lineHeight
                    }}
                    animate={{
                      opacity,
                      translateY: finalY + 8
                    }}
                    transition={{
                      type: 'timing',
                      duration: 150
                    }}>
                    <Text fontSize={12} color="$color9" numberOfLines={1} ellipsizeMode="tail" lineHeight={lineHeight}>
                      {message}
                    </Text>
                  </MotiView>
                )
              })}
            </MotiView>
          )}
        </AnimatePresence>
      </YStack>
    </MotiView>
  )
}

export default MarqueeComponent
