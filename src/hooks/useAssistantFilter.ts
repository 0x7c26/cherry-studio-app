import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Assistant } from '@/types/assistant'
import { groupByCategories } from '@/utils/assistants'

export type FilterType = 'all' | string

interface TabConfig {
  value: string
  label: string
}

export function useAssistantFilter(assistants: Assistant[]) {
  const { t } = useTranslation()
  const [filterType, setFilterType] = useState<FilterType>('all')

  const assistantGroups = useMemo(() => {
    return groupByCategories(assistants)
  }, [assistants])

  const filteredAssistants = useMemo(() => {
    if (filterType === 'all') {
      return assistants
    }

    return assistants.filter(assistant => assistant.group && assistant.group.includes(filterType))
  }, [filterType, assistants])

  const tabConfigs = useMemo(() => {
    const groupKeys = Object.keys(assistantGroups).sort()

    const allTab: TabConfig = {
      value: 'all',
      label: t('assistants.market.groups.all')
    }

    const categoryTabs: TabConfig[] = groupKeys.map(groupKey => ({
      value: groupKey,
      label: t(`assistants.market.groups.${groupKey}`, groupKey.charAt(0).toUpperCase() + groupKey.slice(1))
    }))

    return [allTab, ...categoryTabs]
  }, [assistantGroups, t])

  return {
    filterType,
    setFilterType,
    filteredAssistants,
    tabConfigs,
    assistantGroups
  }
}
