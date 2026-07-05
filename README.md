# Audit ISO 27001

Sistema web para gestionar auditorías ISO/IEC 27001 con separación por usuario, persistencia local y reporte ejecutivo.

## Resumen

- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, SQLite/libSQL, Recharts y SweetAlert2.
- Auth: sesión por cookie httpOnly con aislamiento por usuario.
- Auditoría: equipo, respuestas, progreso, recomendaciones y reporte final.
- Catálogo ISO: dominios, controles y preguntas normalizados en base de datos.

## Funcionalidades

- Registro e inicio de sesión.
- Aislamiento de auditorías por alumno/usuario.
- Registro del equipo auditor con nombre, apellido y email.
- Wizard guiado para evaluar controles ISO 27001.
- Reporte con métricas, radar, barras y recomendaciones automáticas.
- Persistencia en SQLite con fallback y migración de datos legados.

## Estructura

```bash
audit-iso/
├── src/
│   ├── app/              # Rutas, páginas y API routes
│   │   ├── api/          # login, logout, session, iso y audit
│   │   ├── audit/        # team, wizard y report
│   │   └── register/     # autenticación
│   ├── components/       # layout y UI reutilizable
│   ├── context/          # AuthContext y AuditContext
│   ├── features/         # componentes por dominio funcional
│   ├── lib/              # DB, sesión, catálogo ISO y utilidades
│   ├── styles/           # estilos globales
│   └── types/            # tipos TypeScript
├── public/               # activos estáticos
├── audit.db              # base local de desarrollo
└── package.json
```

## Modelo de datos

- `roles 1:N users`
- `users 1:N audits`
- `audits 1:N audit_team_members`
- `audits 1:N audit_responses`
- `iso_domains 1:N iso_controls`
- `iso_controls 1:N iso_questions`
- `iso_questions 1:N audit_responses`

## Requisitos

- Node.js 18 o superior.
- npm.

## Ejecución

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run start`

## Notas

- El equipo auditor usa `email` en lugar de `carnet`.
- La base local `audit.db` es solo para desarrollo.
- El catálogo ISO se inicializa y consulta desde la base de datos.
