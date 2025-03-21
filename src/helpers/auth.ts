import { userDataSchema, useUserDataStore } from '@/stores/userData'
import { setGlobalError, unsetGlobalError } from './error'

export function checkAuth(): boolean {
  return !!localStorage.getItem('auth_token')
}

export function getOauthToken(): string {
  const result = localStorage.getItem('auth_token')
  if (!result) {
    console.error('Trying to get auth token without it')
    throw new Error('No auth token')
  }
  return result
}

export async function ensureUserData() {
  unsetGlobalError('userdata')
  try {
    if (!checkAuth()) {
      throw new Error('Not authenticated before fetching user data')
    }
    const result = await fetch('/api/oauth/me', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('auth_token'),
      },
    })
    if (!result.ok) {
      throw new Error('User data error: ' + result.status + ' ' + result.statusText)
    }
    const raw_data = await result.json()
    const userData = userDataSchema.parse(raw_data)
    const { setUserData } = useUserDataStore()
    setUserData(userData)
  } catch (e) {
    setGlobalError('userdata', e)
  }
}

export async function authRedirect() {
  unsetGlobalError('auth')
  try {
    const result = await fetch('/api/oauth/auth_url')
    if (!result.ok) {
      throw new Error('Auth error: ' + result.status + ' ' + result.statusText)
    }
    localStorage.setItem('after_auth_redirect', window.location.href)
    window.location.href = (await result.json()).url
  } catch (e) {
    setGlobalError('auth', e)
  }
}

export async function prodAuthRedirect() {
  console.error('Todo prodAuthRedirect')
}

export function afterAuthRedirect() {
  const redirect = localStorage.getItem('after_auth_redirect')
  if (redirect && redirect !== window.location.href) {
    localStorage.removeItem('after_auth_redirect')
    window.location.href = redirect
  } else {
    window.location.href = '/'
  }
}

export async function authByCode(code: string, state: string): Promise<boolean> {
  unsetGlobalError('auth')
  try {
    const result = await fetch('/api/oauth/code_to_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
    })
    if (!result.ok) {
      throw new Error('Auth error: ' + result.status + ' ' + result.statusText)
    }
    const data = await result.json()
    console.log('Auth data', data)
    localStorage.setItem('auth_token', data.access_token)
    localStorage.setItem('auth_refresh_token', data.refresh_token)
    return true
  } catch (e) {
    setGlobalError('auth', e)
  }
  return false
}
