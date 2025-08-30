# CRUNEVO - Red Social Educativa Universitaria

Plataforma educativa que conecta estudiantes universitarios mediante apuntes, recursos, foros y herramientas de IA con economía virtual Crolars.

## Tecnologías

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + SQLite
- NextAuth.js
- React Query

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## Development Notes

- Global navigation now uses a single `MainLayout` from `app/layout.tsx`, ensuring the navbar is available throughout the site.
- Various TypeScript errors were resolved and notification components were corrected for consistent behavior.
- Gamification notifications are now categorized as `GAMIFICATION`, fixing local build errors.

## Local Deployment

To run the project locally:

1. Install dependencies with `npm install`.
2. Build the application using `npm run build`.
3. Start the server with `npm start` or use `npm run dev` for development mode.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## Linting

Para facilitar el proceso de compilación se desactivaron las reglas `no-unused-vars`, `no-explicit-any`, `no-empty-object-type` y `no-case-declarations` en `eslint.config.js`. Estas reglas pueden reactivarse una vez que el código esté depurado.

### Verificación de Workspace

Con el servidor en ejecución, puedes validar rápidamente que la API y la página de Workspace respondan ejecutando:

```bash
npm run check-workspace
```

Este comando realiza peticiones a `/api/workspace/debug`, `/api/workspace/boards` y `/workspace` y finaliza con estado exitoso si todas responden correctamente.

