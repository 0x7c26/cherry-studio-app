import { Model } from '@/types/assistant'

interface SelectOptionItem {
  label: string
  value: string
  data?: Model
}

interface SelectOptionGroup {
  label: string
  title?: string
  options: SelectOptionItem[]
}

interface ModelSelectProps {
  value: string | undefined
  onValueChange: (value: string) => void
  selectOptions: SelectOptionGroup[]
  placeholder: string
}

export function ModelSelect({ value, onValueChange, selectOptions, placeholder }: ModelSelectProps) {
  const handleValueChange = (newValue: string, item?: SelectOptionItem) => {
    onValueChange(newValue)
    // 如果需要访问完整的模型信息，可以使用 item?.model
  }

  return null
}
