import i18n from 'i18next'

import { loggerService } from '@/services/LoggerService'

const t = i18n.t

const logger = loggerService.withContext('i18n:label')

const getLabel = (keyMap: Record<string, string>, key: string, fallback?: string) => {
  const result = keyMap[key]

  if (result) {
    return t(result)
  } else {
    logger.error(`Missing key ${key}`)
    return fallback ?? key
  }
}

const providerKeyMap = {
  '302ai': 'provider.302ai',
  aihubmix: 'provider.aihubmix',
  alayanew: 'provider.alayanew',
  anthropic: 'provider.anthropic',
  'aws-bedrock': 'provider.aws-bedrock',
  'azure-openai': 'provider.azure-openai',
  baichuan: 'provider.baichuan',
  'baidu-cloud': 'provider.baidu-cloud',
  burncloud: 'provider.burncloud',
  cephalon: 'provider.cephalon',
  cherryin: 'provider.cherryin',
  copilot: 'provider.copilot',
  dashscope: 'provider.dashscope',
  deepseek: 'provider.deepseek',
  dmxapi: 'provider.dmxapi',
  doubao: 'provider.doubao',
  fireworks: 'provider.fireworks',
  gemini: 'provider.gemini',
  'gitee-ai': 'provider.gitee-ai',
  github: 'provider.github',
  gpustack: 'provider.gpustack',
  grok: 'provider.grok',
  groq: 'provider.groq',
  hunyuan: 'provider.hunyuan',
  hyperbolic: 'provider.hyperbolic',
  infini: 'provider.infini',
  jina: 'provider.jina',
  lanyun: 'provider.lanyun',
  lmstudio: 'provider.lmstudio',
  minimax: 'provider.minimax',
  mistral: 'provider.mistral',
  modelscope: 'provider.modelscope',
  moonshot: 'provider.moonshot',
  'new-api': 'provider.new-api',
  nvidia: 'provider.nvidia',
  o3: 'provider.o3',
  ocoolai: 'provider.ocoolai',
  ollama: 'provider.ollama',
  openai: 'provider.openai',
  openrouter: 'provider.openrouter',
  perplexity: 'provider.perplexity',
  ph8: 'provider.ph8',
  ppio: 'provider.ppio',
  qiniu: 'provider.qiniu',
  qwenlm: 'provider.qwenlm',
  silicon: 'provider.silicon',
  stepfun: 'provider.stepfun',
  'tencent-cloud-ti': 'provider.tencent-cloud-ti',
  together: 'provider.together',
  tokenflux: 'provider.tokenflux',
  vertexai: 'provider.vertexai',
  voyageai: 'provider.voyageai',
  xirang: 'provider.xirang',
  yi: 'provider.yi',
  zhinao: 'provider.zhinao',
  zhipu: 'provider.zhipu',
  poe: 'provider.poe'
} as const

/**
 * 获取内置供应商的本地化标签
 * @param id - 供应商的id
 * @returns 本地化后的供应商名称
 * @remarks
 * 该函数仅用于获取内置供应商的 i18n label
 *
 * 对于可能处理自定义供应商的情况，使用 getProviderName 或 getFancyProviderName 更安全
 */
export const getProviderLabel = (id: string): string => {
  return getLabel(providerKeyMap, id)
}
