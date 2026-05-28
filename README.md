# 🎬 Cine Novavista
Cine Novavista trata de digitalizar la gestión de un cine local mediante el desarrollo de una aplicación web moderna, responsive y conectada a una base de datos en la nube.

---


# 🖥️ Tecnologías utilizadas
· TypeScript: lógica de la aplicación y comunicación con Supabase.,

· SQL (PostgreSQL): consultas a la base de datos Supabase.

· React y Vite: desarrollo del frontend y rutas API.

· TailwindCSS: animaciones y estilos rápidos y adaptativos.

· Base de datos en la nube: Supabase.

· Editor: Visual Studio Code.

· Control de versiones: Git y GitHub.

· Navegador de prueba: Google Chrome.

---


# 👨‍💻 Funcionalidades y roles
Existen 3 tipos de usuarios: usuario invitado, registrado y empleado/administrador.

· Usuario invitado: es el usuario sin registrar, únicamente capaz de ver la página de inicio, registrarse e iniciar sesión.

· Usuario registrado: es el usuario ya registrado, capaz de poder interactuar en la página en su totalidad.

· Administrador: se encarga de todas las funciones administrativas de la página.


| Función | Usuario invitado | Usuario registrado | Administrador |
|------------------------------------------------------------------------|:---:|:---:|:----:|
| Visualizar la cartelera en la página de inicio                         | ✓ | ✓ | ✓ |
| Consultar horarios de proyección, precios y disponibilidad de entradas | ✓ | ✓ | ✓ |
| Registrarse e iniciar sesión                                           | ✓ | X | X |
| Comprar entradas para una película                                     | X | ✓ | X |
| Consultar historial de compras realizadas y descargar comprobantes     | X | ✓ | X |
| Visualizar promociones, próximos estrenos y noticias del cine          | ✓ | ✓ | X |
| Crear, modificar o eliminar películas en cartelera                     | X | X | ✓ |
| Gestionar horarios, salas y precios                                    | X | X | ✓ |
| Administrar usuarios y roles                                           | X | X | ✓ |
| Modificar la información en la cartelera                               | X | X | ✓ |

---


# 📁 Estructura del proyecto
```bash
├── docs/                 # Contiene documentación extensa del proyecto
├── node_modules/         # Dependencias necesarias para el funcionamiento del proyecto
├── public/               # Contiene recursos visuales para el diseño de la página
├── src/
│   ├── components/       # Componentes funcionales reutilizables de la aplicación
│   ├── lib/              # Contiene configuraciones de herramientas externas
│   ├── pages/            # Vistas principales de la aplicación
│   ├── App.tsx           # Nucleo estructural del proyecto
│   ├── index.css         # Contiene la importación de TailwindCSS y estilos
│   └── main.tsx          # Primer archivo que se ejecuta al entrar a la web
├── .env.local            # 
├── eslint.config.js      # Archivo de configuración del linter
├── index.html            # Archivo HTML necesario para que Vite lo utilice
├── package-lock.json     # Contienen el listado exacto de todas las librerías que usa el proyecto
├── package.json          # Contienen el listado exacto de todas las librerías que usa el proyecto
├── postcss.config.js     # Procesa y compilar las clases de Tailwind para que las use Vite
├── README.md             # Mensaje personalizado con documentación del proyecto
├── tsconfig.app.json     # Configuración de TypeScript
├── tsconfig.json         # Configuración de TypeScript
├── tsconfig.node.json    # Configuración de TypeScript
├── vercel.json           # Da las instrucciones específicas al servidor de Vercel sobre cómo enrutar la aplicación
└── vite.config.ts        # Configura los plugins de React e indica a Vite debe empaquetar el proyecto.
```

---


# 🗂️ Base de datos
Como se ha mencionado previamente, la base de datos se ha implementado con Supabase. Estas son las tablas y vistas principales:

| Tabla / Vista         | Descripción                                                                                                                              |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| USUARIO                       | Gestiona tanto a clientes registrados como al personal mediante la columna booleana esadmin.                                     |
| PELICULA                      | Películas que se muestran en la cartelera del cine (título, duracion, género, etc...).                                           |
| SALA                          | Salas en las que se dan las exhibiciones y su capacidad.                                                                         |
| ASIENTO                       | Asiento en cada sala con su fila y número.                                                                                       |
| ENTRADA                       | Entrada vendida que detalla el usuario registrado que la ha comprado, para qué exhibición y asiento otorgado, entre otras cosas. |
| EXHIBICION                    | Exhibición que muestra una película en una sala y fecha determinada.                                                             |
| NOTICIA                       | Noticia que se muestra en la página de inicio.                                                                                   |
| vista_dashboard_diario        | Agrupa el número de entradas vendidas y la suma de dinero recaudado por fecha.                                                   |
| vista_dashboard_top_peliculas | Relaciona las películas con sus entradas para calcular el total de tickets vendidos y los ingresos generados.                    |

---


# 💻 Despliegue
La aplicación final está desplegada Vercel, para acceder a ella, entra en este enlace: 

https://cine-novavista-tfg.vercel.app/

---


# 🆗 Instalación y ejecución local
-1. Clonar el repositorio: 
Abre la terminal y clona el proyecto desde GitHub utilizando el siguiente comando:
git clone https://github.com/R4smu/TFG

-2. Instalar dependencias: 
Ejecuta el gestor de paquetes para descargar todas las librerías necesarias (incluyendo React, Tailwind y el SDK de Supabase):
npm install

-3. Configurar variables de entorno: 
Crea un archivo llamado .env.local en la raíz del proyecto. Aquí debes incluir las claves de conexión a tu base de datos Supabase:

VITE_SUPABASE_URL=https://trtbffiyfhzjncmtszhw.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_b7oOLTNFBse2Bnbs1VE4jg_vA6nbY8D

-4. Ejecución:
Inicia la aplicación en modo local con npm run dev en la terminal dentro de la carpeta del proyecto. Abre tu navegador de prueba y dirígete a http://localhost:5173


---


# 📈 Trayectoría y evolución del proyecto
### Etapa de Planificación y Diseño<br>
> Primeros conceptos, diseño de la arquitectura orientada a la venta de entradas y demás.

**07/10/2025** · Creación de la identidad visual: Desarrollo de la marca Cine Novavista, diseño de un logotipo con estética neo-retro y definición de la paleta de colores para la interfaz en modo oscuro.

**14/10/2025** · Reunión de toma de requisitos: Elaboración del documento para definir el alcance del sistema de reservas, la gestión de cartelera y los roles de administrador y taquillero.

**21/10/2025** · Acta de reuniones: Redacción formal del documento para la validación técnica inicial y cierre de los acuerdos sobre los flujos de pago.

**23/10/2025** · Puesta en marcha del proyecto: Definición del cronograma de despliegue y distribución de tareas para los módulos de usuario y administración.

**28/10/2025** · Requisitos funcionales y no funcionales: Levantamiento de especificaciones técnicas, incluyendo la generación de códigos QR para las entradas y los tiempos máximos de carga de la cartelera.

**04/11/2025** · Presentación del proyecto: Exposición del primer borrador de interfaces (UI/UX), destacando la vista en cuadrícula de las películas y el mapa de la sala para la selección de butacas.

**25/11/2025** · Diseño de Base de Datos: Creación del modelo Entidad-Relación abarcando las tablas de Películas, Salas, Exhibiciones y Asientos.

**02/12/2025** · Presentación del Modelo de Datos: Demostración de la arquitectura de la base de datos, explicando cómo se manejará la concurrencia para evitar la doble reserva de una misma butaca.

**09/12/2025** · Optimización del esquema relacional: Normalización de la base de datos y ajustes en la vinculación entre los perfiles de usuarios registrados y su historial de compras.

**16/12/2025** · Cierre de Fase 1: Revisión global del planteamiento y validación final antes de iniciar la programación del Frontend (catálogo) y Backend (lógica de ventas).<br>

### Etapa de Desarrollo y Despliegue<br>
> Realización del código, integración de pasarelas y pruebas con varias demos.

**13/01/2026** · Presentación del primer prototipo funcional: Exhibición de la landing page dinámica, mostrando la cartelera en tiempo real y el carrusel de estrenos.

**20/01/2026** · Revisión de selección de butacas: Demostración del mapa interactivo de la sala. Asignación de colores dinámicos (libre/ocupado).

**27/01/2026** · Validación de módulos: Pruebas del flujo completo de compra. Simulación de transacciones y verificación del envío automatizado de las entradas (PDF/QR).

**03/02/2026** · Presentación del panel de administración: Demostración de la gestión interna: añadir nuevas películas, asignar horarios en las diferentes salas.

**10/02/2026** · Desarrollo del flujo de escáner: Creación de la vista específica para que los empleados validen las entradas mediante lector de QR en la puerta de la sala.

**17/02/2026** · Refactorización de la Landing Page: Pulido del reproductor de tráilers integrado y optimización de las imágenes promocionales para una carga rápida.

**24/02/2026** · Elaboración de manuales: Documentación técnica sobre la infraestructura y justificación del uso de la pasarela de pagos implementada.

**03/03/2026** · Redacción de documentación de usuario: Publicación de la guía operativa dirigida a los empleados del cine (uso de la TPV virtual y control de accesos).

Tutorías

**06/05/2026** · Reunión grupal con Paco: Tema principal centrado en los manuales a entregar y el código final.

**25/05/2026** · Reunión de los 2 grupos de DAW con Paco: Sesión orientada a los tiempos de presentación.


---


# 🧑 Autoría
· 👷 Proyecto realizado por: Lucas Rasmussen Marcos

· 🏫 Durante el grado de Desarrollo de Aplicaciones Web (DAW)

· 📍 En el centro IES Albarregas - Mérida (Extremadura, España)

---


# 📄 Licencia
Este proyecto está bajo la licencia MIT.
