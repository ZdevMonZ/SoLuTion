// Transform the app's TS/TSX for Node integration tests without a browser server.
import { registerHooks } from 'node:module'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL) {
      const url = new URL(specifier, context.parentURL)
      if (!existsSync(url) || statSync(url).isDirectory()) {
        for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
          const candidate = new URL(url.href + ext)
          if (existsSync(candidate)) return next(candidate.href, context)
        }
      }
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.startsWith('file:') && !url.includes('/node_modules/')) {
      if (url.endsWith('.css')) return { format: 'module', source: 'export default {}', shortCircuit: true }
      if (url.endsWith('.json')) return { format: 'module', source: `export default ${readFileSync(new URL(url), 'utf8')}`, shortCircuit: true }
      if (/\.tsx?$/.test(url)) {
        const source = readFileSync(new URL(url), 'utf8').replaceAll('import.meta.env', '({ BASE_URL: "/SoLuTion/", DEV: false })')
        return { format: 'module', shortCircuit: true, source: ts.transpileModule(source, {
          fileName: fileURLToPath(url), compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
        }).outputText }
      }
    }
    return next(url, context)
  },
})
