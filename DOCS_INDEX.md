# Índice de documentación de FinanceApp

## Inicio

| Documento | Propósito |
|---|---|
| [README.md](README.md) | Descripción general, módulos y comandos principales. |
| [INICIO_RAPIDO.md](INICIO_RAPIDO.md) | Instalación y arranque local. |
| [TESTING.md](TESTING.md) | Guía operativa de pruebas. |
| [docs/PRUEBAS_MODULOS.md](docs/PRUEBAS_MODULOS.md) | Estrategia, framework QA, cobertura y límites. |
| [ERRORES_COMUNES.md](ERRORES_COMUNES.md) | Diagnóstico de problemas frecuentes. |

## Arquitectura y desarrollo

| Documento | Propósito |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura de backend, React, Electron y Capacitor. |
| [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) | Estructura actual del repositorio. |
| [docs/API.md](docs/API.md) | Endpoints y contratos REST. |
| [docs/SETUP.md](docs/SETUP.md) | Configuración detallada. |
| [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Flujo para contribuir y verificar cambios. |
| [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md) | Cypress 15, ejecución y solución de problemas en Windows. |

## Entrega y demostración

| Documento | Propósito |
|---|---|
| [docs/GUIA_DEMOSTRACION_RUBRICA.md](docs/GUIA_DEMOSTRACION_RUBRICA.md) | Guion de 30 minutos alineado con la rúbrica. |
| [evidencias/RESULTADOS_PRUEBAS.md](evidencias/RESULTADOS_PRUEBAS.md) | Resultados ejecutados y consolidados, sin mezclar controles manuales. |
| [evidencias/INTEGRACION_TRES_CLIENTES.md](evidencias/INTEGRACION_TRES_CLIENTES.md) | Mismo gasto en web, Android y Electron. |
| [evidencias/INDICE_CAPTURAS_PRESENTACION.md](evidencias/INDICE_CAPTURAS_PRESENTACION.md) | Catálogo y límites de cada captura. |

## Módulos distribuibles

- Web: consultar [README.md](README.md), [TESTING.md](TESTING.md) y
  [docs/CYPRESS_GUIDE.md](docs/CYPRESS_GUIDE.md).
- Android: consultar [mobile/README.md](mobile/README.md).
- Electron: consultar los comandos vigentes en [README.md](README.md) y
  [TESTING.md](TESTING.md). Las guías locales de build bajo `installer/` están
  excluidas del repositorio por la configuración actual de `.gitignore`.

## Resultados vigentes documentados

| Área | Resultado |
|---|---:|
| Web unitario | 28/28 |
| Cypress completo | 78/78 |
| Instalador — Node | 14/14 |
| Electron — smoke QA | 1/1 |
| Electron — smoke release | 1/1 |
| Backend — última suite completa | 436/436 |
| Framework QA — última ejecución conservada | 20/20 |
| Android | Integración manual documentada en Pixel 8 Pro |

El release Electron compila el cliente React con la API compartida. No
empaqueta backend ni ocupa el puerto 5000. Android también reutiliza React y se
sincroniza con `npm --prefix mobile run sync:prod` para la demostración.

Última actualización: 14 de julio de 2026.
