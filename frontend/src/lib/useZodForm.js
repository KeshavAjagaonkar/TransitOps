import { useState } from 'react'

export function useZodForm(schema, initialValues) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const reset = () => {
    setValues(initialValues)
    setFieldErrors({})
    setFormError('')
  }

  // Validates, then runs onValid(parsedData) if it passes. Sets
  // fieldErrors and returns early otherwise. Wraps onValid in
  // submitting state and catches thrown errors into formError.
  const handleSubmit = (onValid) => async (event) => {
    event.preventDefault()
    setFormError('')

    const result = schema.safeParse(values)
    if (!result.success) {
      const errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (!errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)
    try {
      await onValid(result.data)
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return { values, updateField, fieldErrors, formError, submitting, handleSubmit, reset, setValues }
}