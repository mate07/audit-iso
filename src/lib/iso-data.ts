import { ISODomain } from "@/types/audit";

export const ISO_27001_DATA: ISODomain[] = [
  {
    id: "A.5",
    number: 5,
    title: "Políticas de Seguridad de la Información",
    description: "Orientación y apoyo de la dirección para la seguridad de la información.",
    controls: [
      {
        id: "A.5.1",
        title: "Dirección de gestión para la seguridad de la información",
        questions: [
          {
            id: "5.1.1.a",
            text: "¿Existen políticas de seguridad?"
          },
          {
            id: "5.1.1.b",
            text: "¿Todas las políticas están aprobadas por el equipo directivo?"
          },
          {
            id: "5.1.1.c",
            text: "¿Existe prueba del cumplimiento de las políticas?"
          }
        ]
      }
    ]
  },
  {
    id: "A.6",
    number: 6,
    title: "Organización de la Seguridad de la Información",
    description: "Marco para la gestión de la seguridad de la información.",
    controls: [
      {
        id: "A.6.1",
        title: "Roles y responsabilidades de seguridad",
        questions: [
          {
            id: "6.1.1",
            text: "¿Se definieron claramente los roles y las responsabilidades de seguridad?"
          },
          {
            id: "6.1.2",
            text: "¿Se ha definido e implementado la segregación de deberes?"
          },
          {
            id: "6.1.3",
            text: "¿Se mantiene contacto con autoridades pertinentes para la verificación del cumplimiento?"
          },
          {
            id: "6.1.4",
            text: "¿Se establece contacto con grupos de interés especiales en relación con la seguridad?"
          },
          {
            id: "6.1.5",
            text: "¿Se evidencia la integración de la seguridad en la gestión de proyectos?"
          }
        ]
      },
      {
        id: "A.6.2",
        title: "Dispositivos móviles y teletrabajo",
        questions: [
          {
            id: "6.2.1",
            text: "¿Se definió una política específica para el uso de dispositivos móviles?"
          },
          {
            id: "6.2.2",
            text: "¿Existe una política formal para el trabajo a distancia (teletrabajo)?"
          }
        ]
      }
    ]
  },
  {
    id: "A.7",
    number: 7,
    title: "Seguridad de los Recursos Humanos",
    description: "Asegurar que los empleados comprenden sus responsabilidades.",
    controls: [
      {
        id: "A.7.1",
        title: "Antes del empleo",
        questions: [
          {
            id: "7.1.1",
            text: "¿Se realizan investigaciones de antecedentes a los empleados antes del empleo?"
          },
          {
            id: "7.1.2",
            text: "¿Están definidos los términos y condiciones de empleo relativos a la seguridad?"
          }
        ]
      },
      {
        id: "A.7.2",
        title: "Durante el empleo",
        questions: [
          {
            id: "7.2.1",
            text: "¿Se han definido las responsabilidades de la dirección en materia de seguridad?"
          },
          {
            id: "7.2.2",
            text: "¿Existe un programa de toma de conciencia, educación y capacitación en seguridad?"
          },
          {
            id: "7.2.3",
            text: "¿Se ha definido un proceso disciplinario formal para violaciones de seguridad?"
          }
        ]
      },
      {
        id: "A.7.3",
        title: "Despido y cambio de empleo",
        questions: [
          {
            id: "7.3.1",
            text: "¿Se han definido responsabilidades para el cese o cambio de empleo?"
          }
        ]
      }
    ]
  },
  {
    id: "A.8",
    number: 8,
    title: "Administración de Activos",
    description: "Identificación y protección de los activos de la organización.",
    controls: [
      {
        id: "A.8.1",
        title: "Responsabilidades por los activos",
        questions: [
          {
            id: "8.1.1",
            text: "¿Existe un inventario completo de activos de información?"
          },
          {
            id: "8.1.2",
            text: "¿Se ha asignado propiedad (owner) a todos los activos del inventario?"
          },
          {
            id: "8.1.3",
            text: "¿Se ha definido una política de 'uso aceptable' de los activos?"
          },
          {
            id: "8.1.4",
            text: "¿Existe una política para la devolución de activos al terminar la relación laboral?"
          }
        ]
      },
      {
        id: "A.8.2",
        title: "Clasificación de la información",
        questions: [
          {
            id: "8.2.1",
            text: "¿Se ha definido una política para la clasificación de la información?"
          },
          {
            id: "8.2.2",
            text: "¿Se han establecido reglas para el etiquetado de la información?"
          },
          {
            id: "8.2.3",
            text: "¿Se han definido procedimientos para el manejo y gestión de activos según su clasificación?"
          }
        ]
      },
      {
        id: "A.8.3",
        title: "Gestión de medios",
        questions: [
          {
            id: "8.3.1",
            text: "¿Se definió una política para la administración de medios extraíbles?"
          },
          {
            id: "8.3.2",
            text: "¿Existen procedimientos para la eliminación segura de medios de almacenamiento?"
          },
          {
            id: "8.3.3",
            text: "¿Se han definido controles para la transferencia física de medios?"
          }
        ]
      }
    ]
  },
  {
    id: "A.9",
    number: 9,
    title: "Control de Acceso",
    description: "Limitación del acceso a la información y a los sistemas.",
    controls: [
      {
        id: "A.9.1",
        title: "Requisitos de negocio para el control de acceso",
        questions: [
          {
            id: "9.1.1",
            text: "¿Se ha definido y documentado una política de control de acceso?"
          },
          {
            id: "9.1.2",
            text: "¿Existe una política para el acceso a redes y servicios de red?"
          }
        ]
      },
      {
        id: "A.9.2",
        title: "Gestión de acceso de usuario",
        questions: [
          {
            id: "9.2.1",
            text: "¿Existen procedimientos para el registro y baja de usuarios?"
          },
          {
            id: "9.2.2",
            text: "¿Se gestiona el aprovisionamiento de acceso según el perfil del usuario?"
          },
          {
            id: "9.2.3",
            text: "¿Se controla rigurosamente la administración de derechos de acceso privilegiado?"
          },
          {
            id: "9.2.4",
            text: "¿Se gestiona de forma segura la información de autenticación secreta (contraseñas)?"
          },
          {
            id: "9.2.5",
            text: "¿Se realizan revisiones periódicas de los derechos de acceso de los usuarios?"
          },
          {
            id: "9.2.6",
            text: "¿Se eliminan o ajustan los derechos de acceso al terminar o cambiar el empleo?"
          }
        ]
      },
      {
        id: "A.9.3",
        title: "Responsabilidades del usuario",
        questions: [
          {
            id: "9.3.1",
            text: "¿Se instruye a los usuarios en el uso seguro de su información de autenticación?"
          }
        ]
      },
      {
        id: "A.9.4",
        title: "Control de acceso a sistemas y aplicaciones",
        questions: [
          {
            id: "9.4.1",
            text: "¿Se aplican restricciones de acceso a la información según la política?"
          },
          {
            id: "9.4.2",
            text: "¿Se utilizan procedimientos de inicio de sesión seguros?"
          },
          {
            id: "9.4.3",
            text: "¿Se dispone de un sistema de gestión de contraseñas interactivo y seguro?"
          },
          {
            id: "9.4.4",
            text: "¿Se controla el uso de programas de utilidad con privilegios del sistema?"
          },
          {
            id: "9.4.5",
            text: "¿Se restringe el acceso al código fuente de los programas?"
          }
        ]
      }
    ]
  },
  {
    id: "A.10",
    number: 10,
    title: "Criptografía",
    description: "Uso de cifrado para proteger la confidencialidad e integridad.",
    controls: [
      {
        id: "A.10.1",
        title: "Controles criptográficos",
        questions: [
          {
            id: "10.1.1",
            text: "¿Se ha definido una política sobre el uso de controles criptográficos?"
          },
          {
            id: "10.1.2",
            text: "¿Existe una política y procedimientos para la administración de claves criptográficas?"
          }
        ]
      }
    ]
  },
  {
    id: "A.11",
    number: 11,
    title: "Seguridad Física y Medioambiental",
    description: "Prevención de acceso físico no autorizado y daños.",
    controls: [
      {
        id: "A.11.1",
        title: "Áreas seguras",
        questions: [
          { id: "11.1.1", text: "¿Se ha definido un perímetro de seguridad física para las instalaciones?" },
          { id: "11.1.2", text: "¿Existen controles físicos de entrada para proteger las áreas seguras?" },
          { id: "11.1.3", text: "¿Se ha implementado seguridad en oficinas, habitaciones e instalaciones?" },
          { id: "11.1.4", text: "¿Se cuenta con protección contra amenazas externas y medioambientales?" },
          { id: "11.1.5", text: "¿Se definió una política para trabajar en áreas seguras?" },
          { id: "11.1.6", text: "¿Se definió una política para las áreas de entrega y carga?" }
        ]
      },
      {
        id: "A.11.2",
        title: "Equipamiento",
        questions: [
          { id: "11.2.1", text: "¿Se definió una política para el emplazamiento y la protección de equipos?" },
          { id: "11.2.2", text: "¿Se definió una política para las utilidades de soporte?" },
          { id: "11.2.3", text: "¿Se definió una política para la seguridad del cableado?" },
          { id: "11.2.4", text: "¿Se definió una política para el mantenimiento de equipos?" },
          { id: "11.2.5", text: "¿Se definió una política para la eliminación de activos?" },
          { id: "11.2.6", text: "¿Se definió una política para la seguridad de los equipos y activos fuera de las instalaciones?" },
          { id: "11.2.7", text: "¿Se reutilizó o eliminó el equipo de forma segura?" },
          { id: "11.2.8", text: "¿Se definió una política para equipos de usuarios desatendidos?" },
          { id: "11.2.9", text: "¿Se definió una política de escritorio despejado y pantalla despejada?" }
        ]
      }
    ]
  },
  {
    id: "A.12",
    number: 12,
    title: "Seguridad de las Operaciones",
    description: "Asegurar operaciones correctas y seguras de los recursos de procesamiento de información.",
    controls: [
      {
        id: "A.12.1",
        title: "Procedimientos y responsabilidades operativos",
        questions: [
          { id: "12.1.1", text: "¿Se definió una política para los procedimientos operativos documentados?" },
          { id: "12.1.2", text: "¿Se definió una política para la administración de cambios?" },
          { id: "12.1.3", text: "¿Se definió una política para la administración de capacidades?" },
          { id: "12.1.4", text: "¿Se definió una política para la separación de entornos de desarrollo, pruebas y operaciones?" }
        ]
      },
      {
        id: "A.12.2",
        title: "Protección contra malware",
        questions: [
          { id: "12.2.1", text: "¿Se definió una política para los controles contra el malware?" }
        ]
      },
      {
        id: "A.12.3",
        title: "Copia de seguridad",
        questions: [
          { id: "12.3.1", text: "¿Se definió una política para hacer copias de seguridad de sistemas?" },
          { id: "12.3.2", text: "¿Se definió una política para la copia de seguridad de la información?" }
        ]
      },
      {
        id: "A.12.4",
        title: "Registro y monitoreo",
        questions: [
          { id: "12.4.1", text: "¿Se definió una política para el registro de eventos?" },
          { id: "12.4.2", text: "¿Se definió una política para la protección de la información de registro?" },
          { id: "12.4.3", text: "¿Se definió una política para el registro del administrador y del operador?" },
          { id: "12.4.4", text: "¿Se definió una política para la sincronización del reloj?" }
        ]
      },
      {
        id: "A.12.5",
        title: "Control de software operativo",
        questions: [
          { id: "12.5.1", text: "¿Se definió una política para la instalación de software en sistemas operativos?" }
        ]
      },
      {
        id: "A.12.6",
        title: "Administración de vulnerabilidades técnicas",
        questions: [
          { id: "12.6.1", text: "¿Se definió una política para la administración de vulnerabilidades técnicas?" },
          { id: "12.6.2", text: "¿Se definió una política para restringir la instalación de software?" }
        ]
      },
      {
        id: "A.12.7",
        title: "Consideraciones de auditoría de sistemas de información",
        questions: [
          { id: "12.7.1", text: "¿Se definió una política para el control de auditoría del sistema de información?" }
        ]
      }
    ]
  },
  {
    id: "A.13",
    number: 13,
    title: "Seguridad de las Comunicaciones",
    description: "Protección de la información en redes y sus recursos de apoyo.",
    controls: [
      {
        id: "A.13.1",
        title: "Administración de la seguridad de la red",
        questions: [
          { id: "13.1.1", text: "¿Se definió una política para los controles de red?" },
          { id: "13.1.2", text: "¿Se definió una política para la seguridad de los servicios de red?" },
          { id: "13.1.3", text: "¿Se definió una política para la segregación en las redes?" }
        ]
      },
      {
        id: "A.13.2",
        title: "Transferencia de información",
        questions: [
          { id: "13.2.1", text: "¿Se definió una política para las políticas y los procedimientos de transferencia de información?" },
          { id: "13.2.2", text: "¿Se definió una política para los acuerdos sobre transferencias de información?" },
          { id: "13.2.3", text: "¿Se definió una política para la mensajería electrónica?" },
          { id: "13.2.4", text: "¿Se definió una política para los acuerdos de confidencialidad o no divulgación?" },
          { id: "13.2.5", text: "¿Se definió una política para la adquisición, el desarrollo y el mantenimiento de sistemas?" }
        ]
      }
    ]
  },
  {
    id: "A.14",
    number: 14,
    title: "Adquisición, Desarrollo y Mantenimiento de Sistemas",
    description: "Asegurar que la seguridad es parte integral del ciclo de vida de los sistemas.",
    controls: [
      {
        id: "A.14.1",
        title: "Requisitos de seguridad de los sistemas de información",
        questions: [
          { id: "14.1.1", text: "¿Se definió una política para el análisis y la especificación de los requisitos de seguridad de la información?" },
          { id: "14.1.2", text: "¿Se definió una política para la protección de los servicios de aplicaciones en redes públicas?" },
          { id: "14.1.3", text: "¿Se definió una política para la protección de las transacciones de servicios de aplicaciones?" }
        ]
      },
      {
        id: "A.14.2",
        title: "Seguridad en los procesos de desarrollo y soporte",
        questions: [
          { id: "14.2.1", text: "¿Se definió una política para el desarrollo interno?" }
        ]
      }
    ]
  }
];
