// src/components/menu/MenuTab.tsx (重构后)
import { AnimatePresence } from 'moti'
import React, { FC } from 'react'
import { StackProps, Tabs, Text } from 'tamagui'

import { useIsDark } from '@/utils'
import { getGreenColor, getTextPrimaryColor } from '@/utils/color'

export type TabItem = {
  id: string
  label: string
}

interface MenuTabProps extends StackProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (id: string) => void
  children: React.ReactNode
}

export const MenuTab: FC<MenuTabProps> = ({ tabs, activeTab, onTabChange, children, ...stackProps }) => {
  const isDark = useIsDark()
  const inactiveTextColor = getTextPrimaryColor(isDark)

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      orientation="horizontal"
      flexDirection="column"
      flex={1}
      gap={20}
      {...stackProps}>
      <Tabs.List disablePassBorderRadius borderBottomWidth={1} borderColor="$borderColor" backgroundColor="transparent">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <Tabs.Tab
              key={tab.id}
              value={tab.id}
              flex={1}
              paddingVertical={12}
              backgroundColor="transparent"
              borderBottomWidth={isActive ? 2 : 0}
              borderColor={isActive ? getGreenColor(isDark, 100) : 'transparent'}
              focusStyle={{
                borderBottomWidth: isActive ? 4 : 0,
                borderColor: isActive ? getGreenColor(isDark, 100) : 'transparent'
              }}>
              <Text lineHeight={17} color={isActive ? getGreenColor(isDark, 100) : inactiveTextColor}>
                {tab.label}
              </Text>
            </Tabs.Tab>
          )
        })}
      </Tabs.List>

      <AnimatePresence exitBeforeEnter>{children}</AnimatePresence>
    </Tabs>
  )
}
