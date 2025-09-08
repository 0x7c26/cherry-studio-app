import { CircleDollarSign, Eye, Globe, Languages, Lightbulb, Repeat2, Wrench } from '@tamagui/lucide-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, XStack } from 'tamagui'

import {
  isEmbeddingModel,
  isFreeModel,
  isFunctionCallingModel,
  isReasoningModel,
  isRerankModel,
  isVisionModel,
  isWebSearchModel
} from '@/config/models'
import { Model } from '@/types/assistant'

import { CustomTag } from './CustomTag'

interface ModelTagsProps {
  model: Model
  showFree?: boolean
  showReasoning?: boolean
  showToolsCalling?: boolean
  size?: number
}

export const ModelTags: React.FC<ModelTagsProps> = ({
  model,
  showFree = true,
  showReasoning = true,
  showToolsCalling = true,
  size = 12
}) => {
  const { t } = useTranslation()

  const getTags = (
    model: Model,
    showFree: boolean,
    showReasoning: boolean,
    showToolsCalling: boolean,
    size: number
  ) => {
    const result: {
      key: string
      color: string
      icon: React.JSX.Element
      label: string
    }[] = []

    if (isVisionModel(model)) {
      result.push({
        key: 'vision',
        color: '$green20',
        icon: <Eye size={size} color="$green100" />,
        label: t('models.type.vision')
      })
    }

    if (isWebSearchModel(model)) {
      result.push({
        key: 'websearch',
        color: '$blue20',
        icon: <Globe size={size} color="$blue100" />,
        label: t('models.type.websearch')
      })
    }

    if (showReasoning && isReasoningModel(model)) {
      result.push({
        key: 'reasoning',
        color: '$purple20',
        icon: <Lightbulb size={size} color="$purple100" />,
        label: t('models.type.reasoning')
      })
    }

    if (showToolsCalling && isFunctionCallingModel(model)) {
      result.push({
        key: 'function_calling',
        color: '$orange20',
        icon: <Wrench size={size} color="$orange100" />,
        label: t('models.type.function_calling')
      })
    }

    // color need to be replace
    if (isEmbeddingModel(model)) {
      result.push({
        key: 'embedding',
        color: '$foregroundDarkPurple',
        icon: <Languages size={size} color="$foregroundDarkPurple" />,
        label: t('models.type.embedding')
      })
    }

    if (showFree && isFreeModel(model)) {
      result.push({
        key: 'free',
        color: '$yellow20',
        icon: <CircleDollarSign size={size} color="$yellow100" />,
        label: t('models.type.free')
      })
    }

    if (isRerankModel(model)) {
      result.push({
        key: 'rerank',
        color: '$pink20',
        icon: <Repeat2 size={size} color="$pink100" />,
        label: t('models.type.rerank')
      })
    }

    return result
  }

  const tags = getTags(model, showFree, showReasoning, showToolsCalling, size)

  if (tags.length === 0) {
    return null
  }

  return (
    <XStack gap={4} alignItems="center">
      {tags.map(tag => (
        <CustomTag key={tag.key} size={size} color={tag.color} icon={tag.icon}>
          {tag.icon ? '' : <Text color={tag.color}>{tag.label}</Text>}
        </CustomTag>
      ))}
    </XStack>
  )
}
