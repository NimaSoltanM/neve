// components/ui/radio-group.tsx
import * as React from 'react'
import { CircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RadioGroupContextValue {
  value: string
  onChange: (value: string) => void
  name: string
  disabled?: boolean
  dir?: 'ltr' | 'rtl'
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null,
)

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  dir?: 'ltr' | 'rtl'
  name?: string
}

function RadioGroup({
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled,
  dir = 'ltr',
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue || '',
  )
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : uncontrolledValue
  const name = React.useId()

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue)
      }
      onValueChange?.(newValue)
    },
    [isControlled, onValueChange],
  )

  return (
    <RadioGroupContext.Provider
      value={{ value, onChange: handleChange, name, disabled, dir }}
    >
      <div
        data-slot="radio-group"
        className={cn('grid gap-3', className)}
        dir={dir}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function RadioGroupItem({
  className,
  value,
  disabled,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext)

  if (!context) {
    throw new Error('RadioGroupItem must be used within RadioGroup')
  }

  const isSelected = context.value === value
  const isDisabled = disabled || context.disabled

  const handleClick = () => {
    if (!isDisabled && !isSelected) {
      context.onChange(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      data-slot="radio-group-item"
      className={cn(
        'border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
        'aria-invalid:border-destructive dark:bg-input/30',
        'aspect-square size-4 shrink-0 rounded-full border shadow-xs',
        'transition-[color,box-shadow] outline-none focus-visible:ring-[3px]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'relative inline-flex items-center justify-center',
        className,
      )}
      disabled={isDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {isSelected && (
        <div
          data-slot="radio-group-indicator"
          className="absolute inset-0 flex items-center justify-center"
        >
          <CircleIcon className="fill-primary size-2" />
        </div>
      )}
    </button>
  )
}

export { RadioGroup, RadioGroupItem }
