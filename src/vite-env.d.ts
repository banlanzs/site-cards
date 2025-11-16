/// <reference types="vite/client" />

// Extend ImportMeta to include glob with the options we use in this project.
// This prevents TypeScript errors when using `import.meta.glob` with custom options.
interface ImportMeta {
  glob(pattern: string, options?: { eager?: boolean; query?: string; import?: string }): Record<string, string>
}

// Provide a minimal typing for import.meta.env used in the code.
interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
