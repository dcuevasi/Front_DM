# Frontend IPSS - Aplicacion Movil con React Native y Expo

Aplicacion movil nativa multiplataforma para gestionar notas construida con React Native, Expo y TypeScript.

## Descripcion

Aplicacion IPSS (Sistema de Gestion de Notas) que permite a los usuarios:
- Ver lista de notas en tiempo real
- Crear nuevas notas
- Editar notas existentes
- Eliminar notas
- Interfaz intuitiva y responsiva

## Caracteristicas

- **Framework**: React Native con Expo
- **Navegacion**: Expo Router
- **Lenguaje**: TypeScript
- **Plataformas**: Android, iOS, Web
- **Conexion**: API REST con backend Hono
- **Estilos**: Sistema de tema adaptable

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Expo CLI (opcional, pero recomendado)
- Android Studio o Xcode (para desarrollo nativo)
- Dispositivo Android/iOS o emulador

## Instalacion

1. Clonar el repositorio:
```bash
git clone <URL-DEL-REPO>
cd frontend-ipss
```

2. Instalar dependencias:
```bash
npm install
```

## Ejecucion

### En Computadora (Expo Go)

```bash
npm start
```

Esto abrira Expo DevTools. Puedes:
- Presionar `a` para abrir en Android
- Presionar `i` para abrir en iOS
- Presionar `w` para abrir en Web
- Escanear codigo QR con dispositivo Android (Expo Go) o iOS (Camara/Expo Go)

### En Dispositivo Android

```bash
npm run android
```

### En Dispositivo iOS

```bash
npm run ios
```

### En Web

```bash
npm run web
```

## Configuracion de Conexion al Backend

Para conectar con el backend, configura la variable de entorno:

```bash
export EXPO_PUBLIC_API_URL="http://localhost:3000"
npm start
```

O en una sola linea:

```bash
EXPO_PUBLIC_API_URL="http://localhost:3000" npm start
```

## Estructura del Proyecto

```
frontend-ipss/
├── app/
│   ├── _layout.tsx           # Layout raiz
│   ├── +html.tsx             # Configuracion HTML web
│   ├── +not-found.tsx        # Pagina 404
│   ├── login.tsx             # Pantalla de login
│   ├── modal.tsx             # Modal
│   └── (tabs)/
│       ├── _layout.tsx       # Layout de tabs
│       ├── index.tsx         # Tab principal
│       └── two.tsx           # Tab secundario
├── components/
│   ├── AuthContext.tsx       # Contexto de autenticacion
│   ├── Themed.tsx            # Componentes con tema
│   ├── StyledText.tsx        # Texto personalizado
│   ├── useColorScheme.ts     # Hook de esquema de color
│   └── __tests__/            # Tests
├── constants/
│   └── Colors.ts             # Colores de la aplicacion
├── assets/
│   ├── fonts/                # Fuentes personalizadas
│   └── images/               # Imagenes y iconos
├── package.json              # Dependencias
├── tsconfig.json             # Configuracion TypeScript
├── expo-env.d.ts             # Tipos Expo
├── app.json                  # Configuracion Expo
└── README.md                 # Este archivo
```

## Personalizacion

### Temas de Color
Modifica [constants/Colors.ts](constants/Colors.ts) para cambiar los colores de la aplicacion:

```typescript
export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    // ...
  },
  dark: {
    text: '#fff',
    background: '#000',
    // ...
  },
};
```

### Fuentes
Agrega fuentes personalizadas en `assets/fonts/` e importa en tus componentes usando `expo-font`.

## Testing

Ejecutar pruebas:
```bash
npm test
```

## Deployment

### Construir para Produccion

```bash
expo build:android    # Para APK
expo build:ios        # Para IPA
```

### Publicar en Expo
```bash
expo publish
```

## API Backend

La aplicacion se conecta a los siguientes endpoints:

- `GET /health` - Verificar estado del servidor
- `GET /notes` - Obtener todas las notas
- `GET /notes/:id` - Obtener nota por ID
- `POST /notes` - Crear nueva nota
- `PUT /notes/:id` - Actualizar nota
- `DELETE /notes/:id` - Eliminar nota

Ver [backend-ipss](../backend-ipss) para mas detalles sobre la API.

## Solucion de Problemas

### La app no se conecta al backend
- Confirma que el backend este ejecutandose en `http://localhost:3000`
- Revisa que la variable `EXPO_PUBLIC_API_URL` este configurada correctamente

### El boton "Eliminar" no muestra confirmacion ni hace nada (Web)

**Problema:** Al ejecutar la app con `npx expo start --web`, el boton "Eliminar" de las notas no mostraba ninguna caja de confirmacion ni ejecutaba ninguna accion.

**Causa:** Se usaba `Alert.alert()` de React Native, que es un componente **nativo** de iOS/Android. En web (`react-native-web`), `Alert.alert` no renderiza botones personalizados ni ejecuta callbacks `onPress`. Solo muestra un `window.alert()` basico sin interaccion real.

**Solucion:** Reemplazar `Alert.alert` por un `<Modal>` de React Native (que si funciona en web, iOS y Android). Se agrego:
- Un estado `deletingNoteId` para controlar la visibilidad del modal de confirmacion
- Un Modal con mensaje de confirmacion y botones "Cancelar" / "Eliminar"
- La funcion `confirmDeleteNote()` que ejecuta el `DELETE` a la API y actualiza el estado

**Aprendizaje:** No todos los componentes de React Native son compatibles con web. Antes de usar APIs nativas (`Alert`, `Share`, `Vibration`, etc.), verificar si tienen polyfill en `react-native-web` o reemplazarlas por alternativas web-compatibles como `Modal`, `window.confirm()`, o librerias como `react-native-web-alerts`.

### Errores de dependencias
```bash
npm install --legacy-peer-deps
```

### Limpiar cache
```bash
expo start -c
```

## Recursos

- [Documentacion Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Licencia

Este proyecto es privado

## Autor

Proyecto de Desarrollo de Aplicaciones Movil
