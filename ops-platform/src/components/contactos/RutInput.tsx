'use client'

import { Input } from '@/components/ui/input'
import { normalizeRut, validateRut } from '@/lib/validations/rut'
import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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

/**
 * Formatea un RUT mientras el usuario escribe
 * Formato esperado: XXXXXXXX-X (sin puntos)
 */
function formatRutInput(input: string): string {
  // Eliminar todo excepto números y K
  const cleaned = input.replace(/[^0-9Kk]/g, '').toUpperCase()
  
  if (cleaned.length === 0) return ''
  
  // Si tiene más de 1 carácter, agregar guión antes del último
  if (cleaned.length > 1) {
    const body = cleaned.slice(0, -1)
    const verifier = cleaned.slice(-1)
    return `${body}-${verifier}`
  }
  
  return cleaned
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
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  useEffect(() => {
    if (value) {
      const normalized = normalizeRut(value)
      setDisplayValue(normalized)
      const valid = validateRut(normalized)
      setIsValid(valid)
      setShowValidation(normalized.length >= 9) // Mostrar validación cuando tenga al menos 9 caracteres
      onValidationChange?.(valid)
    } else {
      setDisplayValue('')
      setIsValid(null)
      setShowValidation(false)
      onValidationChange?.(false)
    }
  }, [value, onValidationChange])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Formatear el input
    const formatted = formatRutInput(inputValue)
    setDisplayValue(formatted)

    // Normalizar y validar
    const normalized = normalizeRut(formatted)
    
    // Solo validar si tiene el formato mínimo (al menos 9 caracteres: 12345678-9)
    if (normalized.length >= 9 && normalized.includes('-')) {
      const valid = validateRut(normalized)
      setIsValid(valid)
      setShowValidation(true)
      onValidationChange?.(valid)
    } else {
      setIsValid(null)
      setShowValidation(false)
      onValidationChange?.(false)
    }

    // Enviar valor normalizado al onChange
    onChange?.(normalized)
  }

  const handleBlur = () => {
    // Al perder el foco, mostrar validación si hay contenido
    if (displayValue.length > 0) {
      setShowValidation(true)
      const valid = validateRut(normalizeRut(displayValue))
      setIsValid(valid)
      onValidationChange?.(valid)
    }
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
          onBlur={handleBlur}
          placeholder="12345678-9"
          maxLength={10}
          className={cn(
            'pr-10 font-mono',
            error && 'border-destructive',
            isValid === true && 'border-green-500 focus-visible:ring-green-500',
            isValid === false && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        {showValidation && displayValue && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid === true && (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
            {isValid === false && (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
          </div>
        )}
        {!showValidation && displayValue && displayValue.length < 9 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
        )}
      </div>
      
      {/* Mensaje de error personalizado */}
      {error && (
        <div className="flex items-start gap-2">
          <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      
      {/* Mensaje de validación */}
      {!error && showValidation && displayValue && (
        <div className="flex items-start gap-2">
          {isValid === true ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">RUT válido</p>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                RUT inválido. Verifica el dígito verificador
              </p>
            </>
          )}
        </div>
      )}
      
      {/* Hint de formato */}
      {!error && !showValidation && !displayValue && (
        <p className="text-xs text-muted-foreground">Formato esperado: XXXXXXXX-X (sin puntos)</p>
      )}
    </div>
  )
}
