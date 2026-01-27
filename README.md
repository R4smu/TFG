# 🎬 Cine Novavista
Cine Novavista trata de digitalizar la gestión de un cine local mediante el desarrollo de una aplicación web moderna, responsive y conectada a una base de datos en la nube.

---


# 🍿 Introducción
abc

---


# 🖥️ Tecnologías utilizadas
abc

---


# 👨‍💻 Funcionalidades y roles
Existen 3 tipos de usuarios: usuario invitado, registrado y empleado/administrador.

· Usuario invitado: es el usuario sin registrar, únicamente capaz de ver la página de inicio, registrarse e iniciar sesión.

· Usuario registrado: es el usuario ya registrado, capaz de poder interactuar en la página en su totalidad.

· Empleado/administrador: empleado o administrador de la página, se encarga de todas las funciones administrativas de la página.


| Función | Usuario invitado | Usuario registrado | Empleado |
|------------------------------------------------------------------------|:---:|:---:|:----:|
| Visualizar la cartelera en la página de inicio                         | ✓ | ✓ | ✓ |
| Consultar horarios de proyección, precios y disponibilidad de entradas | ✓ | ✓ | ✓ |
| Registrarse e iniciar sesión                                           | ✓ | X | X |
| Reservar y comprar entradas para una película                          | X | ✓ | X |
| Consultar historial de reservas realizadas y descargar comprobantes    | X | ✓ | X |
| Visualizar promociones, próximos estrenos y noticias del cine          | ✓ | ✓ | X |
| Crear, modificar o eliminar películas en cartelera                     | X | X | ✓ |
| Gestionar horarios, salas y precios                                    | X | X | ✓ |
| Administrar usuarios y roles                                           | X | X | ✓ |
| Modificar la información en la cartelera                               | X | X | ✓ |

---


# 📁 Estructura del proyecto
abc

---


# 🗂️ Base de datos
Como se ha mencionado previamente, la base de datos se ha implementado con Supabase. Estas son las tablas principales:

| Tabla                 | Descripción                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| PELICULA              | Películas que se muestran en el cine (título, duracion, género, etc...).                                                         |
| SALA                  | Salas en las que se dan las exhibiciones y su capacidad.                                                                         |
| ASIENTO               | Asiento en cada sala con su fila y número.                                                                                       |
| CLIENTE               | Usuario registrado en la aplicación.                                                                                             |
| ENTRADA               | Entrada vendida que detalla el usuario registrado que la ha comprado, para qué exhibición y asiento otorgado, entre otras cosas. |
| EXHIBICION            | Exhibición que muestra una película en una sala y fecha determinada.                                                             |
| PROMOCION             | Oferta especial que se le puede aplicar a una exhibición en específico.                                                          |
| PROMOCION_EXHIBICION  | Tabla especial para gestionar la conexión entre la exhibición y la promoción.                                                    |
| NOTICIA               | Noticia que se muestra en la página de inicio.                                                                                   |
| EMPLEADO              | Empleado registrado que se encarga de la gestión.                                                                                |

---


# 💻 Despliegue
La aplicación final está desplegada Vercel, para acceder a ella, entra en este enlace: 

---


# 🆗 Instalación y ejecución local
abc

---


# ⌨️ Comandos (?)
abc

---


# 📈 Trayectoría y evolución del proyecto
abc

---


# 🧑 Autoría
· 👷 Proyecto realizado por: Lucas Rasmussen Marcos

· 🏫 Durante el grado de Desarrollo de Aplicaciones Web (DAW)

· 📍 En el centro IES Albarregas - Mérida (Extremadura, España)

---


# 📄 Licencia
Este proyecto está bajo la licencia MIT.
