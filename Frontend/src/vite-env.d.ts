/// <reference types="vite/client" />

declare module '*.css' {
  const css: { [key: string]: string }
  export default css
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
