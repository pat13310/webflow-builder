/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBHOOK_SERVER_URL: string
  readonly VITE_WEBHOOK_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
