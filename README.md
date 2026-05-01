# Frontend IPSS - Aplicación Móvil con React Native y Expo

Aplicación móvil nativa multiplataforma para gestionar tareas construida con React Native, Expo y TypeScript.

## 📋 Descripción

Aplicación IPSS (Sistema de Gestión de Tareas) que permite a los usuarios:
- Ver lista de tareas en tiempo real
- Crear nuevas tareas
- Marcar tareas como completadas
- Editar tareas existentes
- Eliminar tareas
- Interfaz intuitiva y responsiva

## 🚀 Características

- **Framework**: React Native con Expo
- **Navegación**: Expo Router
- **Lenguaje**: TypeScript
- **Plataformas**: Android, iOS, Web
- **Conexión**: API REST con backend Hono
- **Estilos**: Sistema de tema adaptable

## 📦 Requisitos Previos

- Node.js 18+
- npm o yarn
- Expo CLI (opcional, pero recomendado)
- Android Studio o Xcode (para desarrollo nativo)
- Dispositivo Android/iOS o emulador

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone <URL-DEL-REPO>
cd frontend-ipss
```

2. Instalar dependencias:
```bash
npm install
```

## ▶️ Ejecución

### En Computadora (Expo Go)

```bash
npm start
```

Esto abrirá Expo DevTools. Puedes:
- Presionar `a` para abrir en Android
- Presionar `i` para abrir en iOS
- Presionar `w` para abrir en Web
- Escanear código QR con dispositivo Android (Expo Go) o iOS (Cámara/Expo Go)

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

## 🔗 Configuración de Conexión al Backend

Para conectar con el backend, configura la variable de entorno:

### En Windows (PowerShell)
```powershell
$env:EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:3000"
npm start
```

### En Linux/Mac (Bash)
```bash
export EXPO_PUBLIC_API_URL="http://TU_IP_LOCAL:3000"
npm start
```

### Obtener tu IP Local

**Windows**:
```powershell
ipconfig
```
Busca "IPv4 Address" bajo tu adaptador de red activo

**Linux/Mac**:
```bash
ifconfig
```
Busca "inet" en tu interfaz de red

### Ejemplo
Si tu IP es `192.168.1.50`:
```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.50:3000"
npm start
```

## 📁 Estructura del Proyecto

```
frontend-ipss/
├── app/
│   ├── _layout.tsx           # Layout raíz
│   ├── +html.tsx             # Configuración HTML web
│   ├── +not-found.tsx        # Página 404
│   ├── login.tsx             # Pantalla de login
│   ├── modal.tsx             # Modal
│   └── (tabs)/
│       ├── _layout.tsx       # Layout de tabs
│       ├── index.tsx         # Tab principal
│       └── two.tsx           # Tab secundario
├── components/
│   ├── AuthContext.tsx       # Contexto de autenticación
│   ├── Themed.tsx            # Componentes con tema
│   ├── StyledText.tsx        # Texto personalizado
│   ├── useColorScheme.ts     # Hook de esquema de color
│   └── __tests__/            # Tests
├── constants/
│   └── Colors.ts             # Colores de la aplicación
├── assets/
│   ├── fonts/                # Fuentes personalizadas
│   └── images/               # Imágenes y iconos
├── package.json              # Dependencias
├── tsconfig.json             # Configuración TypeScript
├── expo-env.d.ts             # Tipos Expo
├── app.json                  # Configuración Expo
└── README.md                 # Este archivo
```

## 🎨 Personalización

### Temas de Color
Modifica [constants/Colors.ts](constants/Colors.ts) para cambiar los colores de la aplicación:

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

## 🧪 Testing

Ejecutar pruebas:
```bash
npm test
```

## 🚀 Deployment

### Construir para Producción

```bash
expo build:android    # Para APK
expo build:ios        # Para IPA
```

### Publicar en Expo
```bash
expo publish
```

## 🔌 API Backend

La aplicación se conecta a los siguientes endpoints:

- `GET /health` - Verificar estado del servidor
- `GET /todos` - Obtener todas las tareas
- `GET /todos/:id` - Obtener tarea por ID
- `POST /todos` - Crear nueva tarea
- `PUT /todos/:id` - Actualizar tarea
- `DELETE /todos/:id` - Eliminar tarea

Ver [backend-ipss](../backend-ipss) para más detalles sobre la API.

## 🐛 Solución de Problemas

### La app no se conecta al backend
- Verifica que PC y dispositivo estén en la misma red Wi-Fi
- Confirma que el backend esté ejecutándose en `http://IP_LOCAL:3000`
- Revisa la IP configurada en `EXPO_PUBLIC_API_URL`

### Errores de dependencias
```bash
npm install --legacy-peer-deps
```

### Limpiar caché
```bash
expo start -c
```

## 📚 Recursos

- [Documentación Expo](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 Licencia

Este proyecto es privado

## 👤 Autor

Proyecto de Desarrollo de Aplicaciones Móvil
