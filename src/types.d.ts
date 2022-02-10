/// <reference types="vite/client" />

declare module 'virtual:pwa-register/react' {
  // @ts-ignore ignore when react is not installed
  import { Dispatch, SetStateAction } from 'react'

  export type RegisterSWOptions = {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: any) => void
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>]
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}

type Work = {
  title: string
  description: string
  role: Array<'产品' | '设计' | '前端开发' | '后端开发' | '运营'>
  url?: string
  images: {
    src: string
    style?: 'block' | 'inline'
  }[]
}