export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.error || error.response.data?.message || 'Server error'
    
    switch (status) {
      case 401:
        return 'Authentication required. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 422:
        return message || 'Invalid data provided.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return message
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.'
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.'
  }
}

export const withErrorHandling = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args)
    } catch (error) {
      const errorMessage = handleApiError(error)
      throw new Error(errorMessage)
    }
  }
}

export const createAsyncHandler = (setLoading, setError, setData) => {
  return async (asyncFn) => {
    try {
      setLoading(true)
      setError(null)
      const result = await asyncFn()
      setData(result)
      return result
    } catch (error) {
      const errorMessage = handleApiError(error)
      setError(errorMessage)
      console.error('Async operation failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }
}
