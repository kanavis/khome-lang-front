import { getOauthToken, failAuthRedirect } from '@/helpers/auth'
import { setGlobalError } from '@/helpers/error'

export class HTTPClient {
  async fetchJSON(
    url: string,
    options: RequestInit = {},
    errorKey: string = 'http',
  ): Promise<unknown> {
    try {
      const result = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getOauthToken()}`,
          ...options.headers,
        },
      })
      if (!result.ok) {
        if (result.status === 401) {
          console.error('Auth failed')
          await failAuthRedirect()
        }
        if (result.status === 404 && result.headers.get('X-Init-Required') === 'true') {
          return undefined
        }
        throw new Error(`HTTP error: ${result.status} ${await result.text()}`)
      }
      const parsed = await result.json()
      return parsed
    } catch (e) {
      setGlobalError(errorKey, e)
      throw e
    }
  }
}
