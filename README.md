# 🛡️ Bóveda Financiera — PWA de Registro de Dinero Ultra-Segura

Aplicación Web Progresiva (**PWA**) instalable en teléfonos móviles y PC para registrar ingresos y salidas de dinero con **cifrado de grado militar (Zero-Knowledge)**, motor predictivo de autocompletado y ledger de auditoría inmutable.

Diseñada especialmente para máxima privacidad: **sin huella digital requerida** (ideal para teléfonos con mica protectora de pantalla), **sin enviar tus datos a la nube**, y **con bloqueo estricto de pantalla para que nadie vea tus finanzas**.

---

## 🚀 Cómo Iniciar y Probar la Aplicación

### Opción A: Probar en tu PC o en tu Celular (Vía Wi-Fi Local)

1. En la carpeta del proyecto, ejecuta:
   ```bash
   npm run dev -- --host
   ```
2. La terminal te mostrará dos enlaces:
   - **Local:** `http://localhost:5173/` (para abrir en tu computadora).
   - **Network:** `http://192.168.x.x:5173/` (para abrir directamente desde el navegador de tu celular conectado al mismo Wi-Fi).
3. En tu celular (Chrome o Safari), abre la dirección de **Network** y toca en el menú del navegador: **"Instalar aplicación"** o **"Agregar a la pantalla de inicio"**.

---

### Opción B: Publicar Gratis en GitHub Pages (Acceso Web Permanente)

El proyecto ya incluye el flujo automatizado en `.github/workflows/deploy.yml`:

1. Crea un nuevo repositorio en tu cuenta de [GitHub](https://github.com/new) (por ejemplo: `boveda-dinero`).
2. Conecta tu proyecto local y súbelo:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/boveda-dinero.git
   git branch -M main
   git push -u origin main
   ```
3. En GitHub, ve a **Settings** > **Pages** > En **Source** selecciona **GitHub Actions**.
4. ¡Listo! En menos de 2 minutos tendrás tu enlace `https://TU_USUARIO.github.io/boveda-dinero/` activo con HTTPS para instalar la app directamente en tu celular.

---

## 🔒 Matriz de Seguridad Implementada

| Requisito de Seguridad | Implementación Criptográfica en Bóveda |
| :--- | :--- |
| **Cifrado de respaldos** | Respaldos exportables en formato `.vault` protegidos con contraseña y cifrados mediante **AES-256-GCM**. |
| **Integridad SHA-256** | Cada registro genera un hash encadenado al registro anterior (tipo blockchain) con **SHA-256**. |
| **Auditoría inmutable** | Log inmutable que audita creación, edición, borrado, inicios de sesión y fecha/hora exacta. |
| **Papelera protegida** | Los movimientos borrados van a la papelera. Para eliminarlos definitivamente se exige la contraseña maestra. |
| **Protección fuerza bruta**| Bloqueo progresivo automático: 5 intentos = 30s, 6 intentos = 60s, incrementándose exponencialmente. |
| **Detección de manipulación**| El sistema escanea y valida la integridad de cada hash. Si alguien altera la base de datos, salta una alerta roja. |
| **Ocultar información** | Cero fuga de datos: en pantalla de bloqueo no se muestra ningún saldo ni movimiento. En la app hay un botón de ojo para enmascarar con `••••••`. |
| **Autenticación Argon2id** | Derivación de clave maestra con **Argon2id** (64MB memoria, 3 iteraciones) resistente a ataques por GPU/ASIC. |
| **Segundo Factor (TOTP)** | Compatible con Google Authenticator, Aegis y Authy con código QR generado 100% offline. |
| **Autobloqueo a los 2 min** | Temporizador de inactividad de 2 minutos que purga las claves de la memoria RAM inmediatamente. |
| **100% Offline (PWA)** | Service Worker con precaching total e IndexedDB cifrada local. Cero dependencia de servidores externos. |
| **Apto para micas de celular**| Sin huella digital forzada, acceso por contraseña maestra ultra-segura + 2FA opcional. |

---

## 💡 Funcionalidades Principales

1. **Dinero General (Poner saldo a mano):**
   - Tarjeta destacada en la parte superior.
   - Botón **"Poner a mano"** para establecer tu saldo real actual en efectivo/cuenta.
   - Calcula en tiempo real: `Saldo base a mano + Total Ingresos - Total Salidas`.

2. **Registro de Salidas e Ingresos con "El Por Qué":**
   - **Autocompletado Predictivo:** Mientras escribes (ej. *"Compré un alf..."*), la aplicación despliega sugerencias instantáneas para completar tu frase en 1 toque.
   - **Generalizado para todo:** Comida, snacks, tiendas, pasajes de bus, taxi, luz, agua, internet, recargas, salud, salidas, farmacia.
   - **Ingresos completos:** Sueldos, propinas familiares, cobro de deudas, trabajos extras, ventas de cosas usadas.
   - **Aprendizaje automático:** Cada nueva frase que guardes queda registrada en tu diccionario cifrado personal para sugerírtela en futuras ocasiones.

3. **Modo Privacidad:**
   - Botón de ojo en la barra superior para ocultar todos los números con `••••••` si alguien está cerca de ti.

4. **Bloqueo Inmediato:**
   - Botón de candado rojo para cerrar la bóveda y borrar los datos de la memoria RAM en 1 segundo.
