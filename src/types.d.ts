/// <reference types="vite/client" />

type Work = {
  title: string
  description: string
  url?: string
  images: {
    src: string
    style?: 'block' | 'inline'
  }[]
}