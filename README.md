# 🛡️ Audit ISO 27001 - Sistema de Gestión de Auditorías

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

## 📝 Descripción

**Audit ISO 27001** es una plataforma web moderna y robusta diseñada para facilitar el proceso de auditoría y cumplimiento normativo del estándar internacional **ISO/IEC 27001**. El sistema permite a los auditores y equipos de seguridad de la información gestionar el ciclo de vida completo de una auditoría, desde el registro del equipo hasta la generación de reportes detallados.

La aplicación ofrece una interfaz intuitiva con seguimiento de progreso en tiempo real, visualización de datos mediante gráficos dinámicos y persistencia de datos local para garantizar la integridad de las evaluaciones.

## ✨ Características Principales

- 📊 **Dashboard de Control**: Visualización rápida del progreso, retos y estado actual de la auditoría.
- 👥 **Gestión de Equipos**: Registro y control del personal involucrado en el proceso de auditoría.
- 📝 **Asistente de Evaluación**: Proceso guiado para completar los controles de la norma.
- 📈 **Reportes Dinámicos**: Generación de informes con gráficos detallados utilizando Recharts.
- 💾 **Persistencia Robusta**: Integración con SQLite para el almacenamiento seguro de datos.
- 🎨 **Interfaz Premium**: Diseño moderno con Tailwind CSS 4 y micro-animaciones.

## 🛠️ Tecnologías Utilizadas

El proyecto está construido con un stack moderno enfocado en el rendimiento y la experiencia de usuario:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Base de Datos**: [SQLite](https://www.sqlite.org/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Alertas**: [SweetAlert2](https://sweetalert2.github.io/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Estructura del Proyecto

```bash
audit-iso/
├── src/
│   ├── app/            # Rutas de la aplicación y endpoints de API
│   ├── components/     # Componentes de interfaz reutilizables (UI)
│   ├── context/        # Proveedores de estado global (AuditContext)
│   ├── features/       # Lógica específica por funcionalidades del sistema
│   ├── hooks/          # Hooks personalizados de React
│   ├── lib/            # Configuración de base de datos y utilidades
│   ├── styles/         # Archivos de estilos globales y temas
│   └── types/          # Definiciones de interfaces y tipos TypeScript
├── public/             # Activos estáticos (imágenes, iconos)
├── audit.db            # Archivo de base de datos SQLite
└── package.json        # Dependencias y scripts del proyecto
```

## 🚀 Instalación Local

Sigue estos pasos para configurar el proyecto en tu entorno local:

### Requisitos Previos

- **Node.js**: Versión 18 o superior recomendada.
- **npm**: Gestor de paquetes.

### Pasos a seguir

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/audit-iso.git
   cd audit-iso
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo**

   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**
   Abre tu navegador y entra en [http://localhost:3000](http://localhost:3000).

---

Desarrollado con ❤️ para la gestión de seguridad de la información.
