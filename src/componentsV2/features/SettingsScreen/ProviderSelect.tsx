import { ProviderType } from '@/types/assistant'

interface SelectOptionItem {
  label: string
  value: string
}

interface SelectOptionGroup {
  label: string
  title?: string
  options: SelectOptionItem[]
}

interface ProviderSelectProps {
  value: ProviderType | undefined
  onValueChange: (value: ProviderType) => void
  placeholder: string
}

const providerOptions: SelectOptionGroup[] = [
  {
    label: 'Providers',
    options: [
      { label: 'OpenAI', value: 'openai' },
      { label: 'OpenAI-Response', value: 'openai-response' },
      { label: 'Gemini', value: 'gemini' },
      { label: 'Anthropic', value: 'anthropic' },
      { label: 'Azure OpenAI', value: 'azure-openai' },
      { label: 'Qwen', value: 'qwenlm' }
    ]
  }
]

export function ProviderSelect({ value, onValueChange, placeholder }: ProviderSelectProps) {
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue as ProviderType)
  }

  return null
}
