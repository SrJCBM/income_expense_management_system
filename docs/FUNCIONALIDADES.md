# Lista de Funcionalidades (preguntas)

Este documento lista las funciones importantes en formato pregunta, con respuesta corta y explicación simple.

- ¿El usuario puede iniciar sesión con credenciales válidas?
  - Sí. Explicación: Si pones tu usuario y contraseña correctos, el sistema te deja entrar.

- ¿El usuario puede registrarse con una cuenta nueva?
  - Sí. Explicación: Hay un formulario para crear una cuenta nueva y registrarte.

- ¿El usuario puede cerrar sesión?
  - Sí. Explicación: Al cerrar sesión se borra la información de la sesión y vuelves a la pantalla de login.

- ¿Se guardan contraseñas de forma segura?
  - Sí. Explicación: Las contraseñas se almacenan en forma encriptada, no en texto plano.

- ¿Hay validación de campos en el formulario?
  - Sí. Explicación: Los formularios piden los campos obligatorios y muestran mensajes si faltan.

- ¿El usuario puede crear, editar y eliminar gastos?
  - Sí. Explicación: Puedes añadir gastos, modificarlos o borrarlos desde la lista de gastos.

- ¿El usuario puede crear, editar y eliminar ingresos?
  - Sí. Explicación: Funciona igual que los gastos pero para ingresos.

- ¿El usuario puede gestionar categorías?
  - Sí. Explicación: Puedes crear, editar o eliminar categorías para organizar tus movimientos.

- ¿Hay filtros para ver gastos e ingresos?
  - Sí. Explicación: Puedes filtrar por categoría y por mes/año para ver solo lo que te interesa.

- ¿Los filtros por mes y categoría funcionan correctamente?
  - Sí. Explicación: El filtro de mes convierte la fecha seleccionada y el filtro de categoría usa las categorías reales del sistema.

- ¿La actividad reciente en el Dashboard se ve bien?
  - Sí. Explicación: El Dashboard muestra un resumen claro de los gastos por categoría.

- ¿Los totales y el balance se muestran correctamente?
  - Sí. Explicación: Se muestran los ingresos, gastos y el balance neto del periodo.

- ¿Los gráficos de reportes funcionan?
  - Sí. Explicación: Hay gráficos que comparan ingresos vs gastos y muestran distribución por categoría.

- ¿Se puede exportar reportes a PDF y Excel?
  - Sí. Explicación: Hay botones para descargar en PDF o Excel; si falta una librería, el sistema usa una versión simplificada.

- ¿El botón PDF fallaba antes por un error técnico?
  - Sí (antes). Explicación: Se arregló para que no rompa la aplicación si falta un componente.

- ¿Hay pruebas automáticas (tests)?
  - Sí. Explicación: El proyecto tiene tests unitarios y pruebas de integración, pero puedes ejecutarlos localmente para ver el estado.

- ¿El backend necesita una base de datos en producción?
  - Sí. Explicación: Para usar la app fuera de desarrollo necesitas configurar la conexión a la base de datos.

- ¿Hay un comprobador de estado (health) para el backend?
  - Sí. Explicación: El sistema tiene un endpoint que indica si el backend está funcionando.

- ¿La app se puede instalar en Windows con un .exe?
  - Sí. Explicación: Se creó un instalador para Windows y está listo en la carpeta `frontend/release`.

- ¿El instalador incluye el servidor (backend)?
  - Sí. Explicación: El instalador incluye el backend para que la app funcione sin instalar más cosas.

- ¿La app muestra errores de red de forma útil?
  - Sí. Explicación: Cuando algo falla con la conexión, la app muestra mensajes para el usuario.

- ¿Las rutas están protegidas por login?
  - Sí. Explicación: Solo puedes acceder a las pantallas privadas si estás logueado.

- ¿Los accesos (tokens) y sesión están controlados?
  - Sí. Explicación: El sistema usa un token para mantener la sesión y verificar accesos.

- ¿La app está lista para distribuir (firma, icono)?
  - Casi. Explicación: El instalador funciona, pero se pueden mejorar el icono y la firma si quieres una versión más profesional.

- ¿La app es accesible y cumple validaciones básicas?
  - En parte. Explicación: Tiene buenas prácticas (roles y accesos por teclado) pero podría necesitar mejoras para cumplir todo WCAG.

- ¿Se registran errores para producción?
  - En parte. Explicación: Hay registros básicos; para producción recomendaria añadir un servicio de monitoreo si quieres más información.


---
Nota: Si quieres, convierto este fichero a un checklist con columnas (Función | Estado | Evidencia / Ruta de prueba) o lo adapto para impresión/entrega al profesor.
