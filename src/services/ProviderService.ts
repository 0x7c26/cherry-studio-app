import { loggerService } from '@/services/LoggerService'
import { Assistant, Model, Provider } from '@/types/assistant'

import {
  deleteProvider as _deleteProvider,
  getAllProviders as _getAllProviders,
  getProviderById as _getProviderById,
  getProviderByIdSync as _getProviderByIdSync,
  upsertProviders
} from '../../db/queries/providers.queries'
import { getDefaultModel } from './AssistantService'
const logger = loggerService.withContext('Provider Service')

export async function saveProvider(provider: Provider) {
  try {
    await upsertProviders([provider])
  } catch (error) {
    logger.error('Error saving provider:', error)
    throw error
  }
}

export async function getProviderById(providerId: string) {
  try {
    const provider = await _getProviderById(providerId)

    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`)
    }

    return provider
  } catch (error) {
    logger.error('Error getting provider by id:', error)
    throw error
  }
}

export async function getAllProviders() {
  try {
    return await _getAllProviders()
  } catch (error) {
    logger.error('Error getting all providers:', error)
    throw error
  }
}

export function getProviderByModel(model: Model): Provider {
  try {
    const provider = _getProviderByIdSync(model.provider)
    if (!provider) throw Error('provider not found')
    return provider
  } catch (error) {
    logger.error('getProviderByModel', error as Error)
    throw error
  }
}

export function getDefaultProvider() {
  return getProviderByModel(getDefaultModel())
}

export async function getAssistantProvider(assistant: Assistant): Promise<Provider> {
  const provider = await getProviderById(assistant.model?.provider || '')
  return provider || getDefaultProvider()
}

export async function deleteProvider(providerId: string) {
  try {
    await _deleteProvider(providerId)
  } catch (error) {
    logger.error('Error deleting provider:', error)
    throw error
  }
}

export function getProviderByIdSync(providerId: string): Provider {
  try {
    const provider = _getProviderByIdSync(providerId)
    if (!provider) throw new Error(`Provider with ID ${providerId} not found`)
    return provider
  } catch (error) {
    logger.error('Error getting provider by id:', error)
    throw error
  }
}
