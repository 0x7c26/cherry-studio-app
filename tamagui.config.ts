import { config } from '@tamagui/config/v3'
import { createTamagui } from '@tamagui/core'

// 扩展配置，添加borderColor
const extendedConfig = {
  ...config,
  tokens: {
    ...config.tokens,
    color: {
      // ...config.tokens.color,
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderColorDark: 'rgba(255, 255, 255, 0.15)',
      cardBackground: '',
      CardBackgroundDark: '#17171b',
      backgroundGreen: 'rgba(0, 185, 107, 0.2)',
      foregroundGreen: 'rgba(0, 185, 107, 1)',
      backgroundRed: 'rgba(216, 57, 31, 0.2)',
      foregroundRed: 'rgba(216, 57, 31, 1)',
      backgroundBlue: 'rgba(28, 128, 254, 0.2)',
      foregroundBlue: 'rgba(28, 128, 254, 1)',
      backgroundPurple: 'rgba(114, 105, 255, 0.2)',
      foregroundPurple: 'rgba(114, 105, 255, 1)',
      backgroundOrange: 'rgba(242, 136, 57, 0.2)',
      foregroundOrange: 'rgba(242, 136, 57, 1)',
      backgroundYellow: 'rgba(255, 202, 0, 0.2)',
      foregroundYellow: 'rgba(255, 202, 0, 1)',
      backgroundDarkPurple: 'rgba(56, 67, 255, 0.2)',
      foregroundDarkPurple: 'rgba(56, 67, 255, 1)',
      backgroundGray: 'rgba(135, 142, 168, 0.2)',
      foregroundGray: 'rgba(135, 142, 168, 1)',
      //////// new colors ////////
      colorBrand: '#00b96bff',
      colorBorderLinearLight: '#000000ff',
      colorBorderLinearDark: '#ffffffff',
      purple100: '#9c96f9ff',
      purple20: '#9c96f933',
      green100Light: '#81df94ff',
      green100Dark: '#acf3a6ff',
      green20Light: '#8de59e4d',
      green20Dark: '#acf3a633',
      green10Light: '#8de59e26',
      green10Dark: '#acf3a61a',
      orange100Light: '#ffb26eff',
      orange20: '#ffb26e33',
      blue100: '#6fb1faff',
      blue20: '#6fb1fa33',
      yellow100: '#f2e218ff',
      yellow100Dark: '#f9ea42ff',
      yellow20Light: '#f2e21833',
      yellow20Dark: '#f9ea4233',
      pink100: '#e398c9ff',
      pink20: '#e398c933',
      red100: '#ff0000ff',
      red20: '#ff000033',
      red10: '#ff00001a',
      gray80: '#a0a1b0cc',
      gray60: '#a0a1b099',
      gray40: '#a0a1b066',
      gray20: '#a0a1b033',
      gray10: '#a0a1b01a',
      backgroundPrimaryLight: '#f7f7f7ff',
      backgroundPrimaryDark: '#121213ff',
      backgroundSecondaryLight: '#ffffff99',
      backgroundSecondaryDark: '#20202099',
      uiCardLight: '#ffffffff',
      uiCardDark: '#19191cff',
      textPrimaryLight: '#202020ff',
      textPrimaryDark: '#f9f9f9ff',
      textSecondaryLight: '#646464ff',
      textSecondaryDark: '#cececeff',
      textDelete: '#dc3e42ff',
      textLink: '#0090ffff'
    }
  }
}

export const tamaguiConfig = createTamagui(extendedConfig)

export default tamaguiConfig

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {
    foo: string
  }
}
