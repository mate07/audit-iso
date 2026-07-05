# Audit ISO 27001

Sistema web para gestionar auditorías ISO/IEC 27001 con separación por usuario, persistencia local y reporte ejecutivo.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-libSQL-003B57?logo=sqlite&logoColor=white)
![PDF](https://img.shields.io/badge/PDF-jsPDF-8A2BE2?logo=adobeacrobatreader&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-16a34a)

## Resumen

- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, SQLite/libSQL, Recharts, jsPDF y SweetAlert2.
- Auth: sesión por cookie httpOnly con aislamiento por usuario.
- Auditoría: equipo, respuestas, progreso, recomendaciones y reporte final.
- Catálogo ISO: dominios, controles y preguntas normalizados en base de datos.

## Funcionalidades

- Registro e inicio de sesión.
- Aislamiento de auditorías por alumno/usuario.
- Registro del equipo auditor con nombre, apellido y email.
- Wizard guiado para evaluar controles ISO 27001.
- Reporte con métricas, radar, barras y recomendaciones automáticas.
- Exportación PDF directa con formato estable, usando datos del reporte y gráficas dibujadas en el documento para evitar fallos de render.
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
- El reporte PDF se genera desde el estado del reporte y no depende de captura visual del navegador.
- Las gráficas del PDF se construyen con los datos calculados de cumplimiento y distribución de estados, para mantener consistencia con la vista.
