'use client'

import { Input } from '@/components/ui/input'
import { formatRutForDisplay, normalizeRut, validateRut } from '@/lib/validations/rut'
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RutInputProps {
  value?: string
  onChange?: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  label?: string
  required?: boolean
  error?: string
  className?: string
}

export function RutInput({
  value = '',
  onChange,
  onValidationChange,
  label = 'RUT',
  required = false,
  error,
  className,
}: RutInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (value) {
      const normalized = normalizeRut(value)
      const formatted = formatRutForDisplay(normalized)
      setDisplayValue(formatted)
      const valid = validateRut(normalized)
      setIsValid(valid)
      onValidationChange?.(valid)
    } else {
      setDisplayValue('')
      setIsValid(false)
      onValidationChange?.(false)
    }
  }, [value, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    // Permitir solo números, puntos, guiones y K
    const cleaned = inputValue.replace(/[^0-9.\-Kk]/g, '')
    setDisplayValue(cleaned)

    // Normalizar y validar
    const normalized = normalizeRut(cleaned)
    const valid = cleaned.length > 0 ? validateRut(normalized) : false
    setIsValid(valid)
    onValidationChange?.(valid)

    // Enviar valor normalizado al onChange
    onChange?.(normalized)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="12.345.678-9"
          className={cn(
            'pr-10',
            error && 'border-destructive',
            isValid && displayValue && 'border-green-500'
          )}
        />
        {displayValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && displayValue && !isValid && (
        <p className="text-sm text-muted-foreground">RUT inválido</p>
      )}
    </div>
  )
}

