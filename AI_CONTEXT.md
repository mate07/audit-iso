# AI Context - Audit ISO 27001

Este documento resume el proyecto para que otros chats basados en IA puedan entender rápidamente la arquitectura, el flujo funcional y las reglas importantes sin tener que inspeccionar todo el código.

## 1. Resumen del proyecto

**Audit ISO 27001** es una aplicación web construida con **Next.js 16 + React 19 + TypeScript** para gestionar auditorías de cumplimiento ISO/IEC 27001.

El sistema permite:

- Registrar y autenticar usuarios.
- Crear y gestionar el equipo auditor.
- Ejecutar un wizard de evaluación por dominios ISO.
- Persistir el progreso de la auditoría.
- Generar reportes ejecutivos con métricas y recomendaciones.

### Objetivo funcional

El objetivo principal es que cada usuario trabaje con su propia auditoría de forma aislada, guardando el estado en la base de datos y mostrando una experiencia guiada para completar controles ISO.

## 2. Stack tecnológico

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS 4
- **Persistencia**: SQLite / libSQL (`@libsql/client`)
- **Gráficas**: Recharts
- **Alertas**: SweetAlert2
- **Iconos**: Lucide React

## 3. Arquitectura general

La app está dividida en estas capas:

- `src/app`: rutas, páginas y API routes.
- `src/context`: estado global del cliente.
- `src/features`: componentes por dominio funcional.
- `src/components`: layout y UI reutilizable.
- `src/lib`: acceso a datos, auth, catálogo ISO y utilidades.
- `src/types`: tipos compartidos.

### Flujo general

1. El usuario entra a `/register`.
2. Se registra o inicia sesión.
3. El backend crea una sesión en servidor y setea una cookie httpOnly.
4. `AuthContext` consulta `/api/auth/me` para restaurar la sesión.
5. `AuditContext` carga el catálogo ISO desde `/api/iso`.
6. `AuditContext` carga la auditoría activa del usuario desde `/api/audit`.
7. El usuario completa el wizard.
8. El estado se sincroniza con la base de datos.
9. El reporte toma datos del contexto y los visualiza.

## 4. Autenticación y aislamiento por usuario

### Cómo funciona

- El login y el registro ya no dependen de `localStorage` como fuente de autoridad.
- El backend crea una sesión con un token y lo guarda en la tabla `sessions`.
- La cookie se marca como `httpOnly`, `sameSite=lax` y con duración limitada.
- Las rutas de auditoría leen el usuario autenticado desde la cookie.

### Regla importante

**No confiar en `userId` enviado por el cliente.**

El backend resuelve el usuario autenticado con la sesión activa. Eso evita que un alumno vea o sobreescriba auditorías ajenas solo por modificar el payload del navegador.

## 5. Modelo de datos

La base está diseñada para reflejar las relaciones reales del sistema y apoyar la normalización.

### Entidades principales

- `roles`
- `users`
- `sessions`
- `audits`
- `audit_team_members`
- `audit_responses`
- `iso_domains`
- `iso_controls`
- `iso_questions`

### Cardinalidades

- `roles 1:N users`
- `users 1:N audits`
- `audits 1:N audit_team_members`
- `audits 1:N audit_responses`
- `iso_domains 1:N iso_controls`
- `iso_controls 1:N iso_questions`
- `iso_questions 1:N audit_responses`

### Notas de normalización

- **1FN**: los valores se guardan de forma atómica.
- **2FN**: el catálogo ISO está separado de la ejecución de auditoría.
- **3FN**: no se repiten datos derivados o dependencias transitivas dentro de respuestas o auditorías.

### Reglas de integridad importantes

- `users.email` es único.
- `audit_responses` tiene unicidad por `(auditId, questionId)`.
- `audit_team_members` tiene unicidad por `(auditId, email)`.
- `audit_team_members` usa `email` en lugar de `carnet`.

## 6. Flujo de negocio

### Registro / Login

- `/register` usa `src/app/api/auth/register/route.ts` y `src/app/api/auth/login/route.ts`.
- Ambos endpoints crean o reutilizan una sesión.
- La sesión se recupera desde `/api/auth/me`.
- El logout se ejecuta con `/api/auth/logout`.

### Auditoría

- `/audit/team`: registro del equipo y datos generales de la organización.
- `/audit/wizard`: evaluación de los controles ISO.
- `/audit/report`: visualización de métricas, gráficas y recomendaciones.

### Persistencia

- `AuditContext` carga y sincroniza estado con `/api/audit`.
- El catálogo ISO se consulta desde `/api/iso`.
- Los cambios se sincronizan con debounce.
- Si el `auditId` local se desincroniza, el contexto puede recrear la auditoría.

## 7. API routes importantes

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Auditoría

- `GET /api/audit`
- `POST /api/audit`
- `DELETE /api/audit`

### Catálogo ISO

- `GET /api/iso`

## 8. Componentes y módulos clave

### Contextos

- `AuthContext`: usuario activo, login/logout, redirección y restauración de sesión.
- `AuditContext`: estado de auditoría, carga del catálogo, sincronización, métricas derivadas.

### Componentes de UI

- `Navbar`
- `MainContainer`
- `SidebarNavigation`
- `Card`
- `Button`
- `Input`
- `Textarea`
- `ProgressBar`
- `StepIndicator`

### Features

- `features/team/components/AuditorCard.tsx`
- `features/audit/components/AuditChecklist.tsx`
- `features/report/components/MetricsCards.tsx`
- `features/report/components/DomainTable.tsx`
- `features/report/components/RecommendationsList.tsx`
- `features/wizard/components/WizardHeader.tsx`

## 9. Catálogo ISO

El catálogo ISO ya no se usa solo como constante de frontend; también se inicializa y consulta desde la base de datos.

### Fuente lógica

- El catálogo base vive en `src/lib/iso-data.ts`.
- `src/lib/iso-catalog.ts` lo siembra en la base y lo carga desde DB.
- `GET /api/iso` expone el catálogo al cliente.

### Estructura del catálogo

- Dominios ISO
- Controles por dominio
- Preguntas por control

## 10. Reglas de negocio actuales

- Cada alumno trabaja con su sesión individual.
- No se comparte estado entre usuarios autenticados distintos.
- El equipo auditor usa `email` como identificador funcional.
- Las respuestas se guardan por pregunta y auditoría.
- El reporte depende del estado de la auditoría activa.
- El catálogo ISO no debe tratarse como hardcoded en la UI.

## 11. Comportamiento del frontend

### Layout global

- `src/app/layout.tsx` envuelve toda la app con `AuthProvider` y `AuditProvider`.
- `Navbar` está en el layout raíz.
- `MainContainer` centraliza el ancho y el padding de contenido.

### Páginas principales

- `/`: dashboard inicial.
- `/register`: auth.
- `/audit/team`: datos generales y equipo.
- `/audit/wizard`: evaluación.
- `/audit/report`: reporte.

## 12. Persistencia y archivo local

- La app usa SQLite/libSQL.
- `audit.db` puede existir en desarrollo local.
- El archivo está considerado un artefacto de desarrollo y no debería tratarse como fuente manual de verdad.

## 13. Comandos útiles

```bash
npm run dev
npm run build
npm run lint
npm run start
```

## 14. Archivos de referencia rápida

- `src/app/layout.tsx`
- `src/context/AuthContext.tsx`
- `src/context/AuditContext.tsx`
- `src/app/api/audit/route.ts`
- `src/lib/db.ts`
- `src/lib/auth-session.ts`
- `src/lib/iso-catalog.ts`
- `src/types/audit.ts`

## 15. Pautas para chats de IA

Cuando un chat basado en IA trabaje sobre este proyecto, conviene asumir lo siguiente:

- La sesión válida vive en cookie y se resuelve en servidor.
- La auditoría pertenece al usuario autenticado.
- El equipo auditor usa `email`, no `carnet`.
- El catálogo ISO está normalizado y se consulta desde DB.
- El frontend depende de `AuditContext` para datos derivados.
- Antes de cambiar algo, revisar si impacta login, sesión o sincronización.

## 16. Riesgos conocidos

- Si la base local tiene datos previos, la migración puede dejar rastros legados.
- El catálogo ISO debe mantenerse sincronizado entre `iso-data.ts` y la semilla de DB.
- Si se cambia el esquema de sesiones, hay que revisar `AuthContext` y las rutas API.

## 17. Estado actual del proyecto

La implementación actual ya incluye:

- aislamiento por usuario,
- catálogo ISO en DB,
- persistencia de auditoría normalizada,
- equipo auditor basado en `email`,
- documentación lista para contexto de IA.

