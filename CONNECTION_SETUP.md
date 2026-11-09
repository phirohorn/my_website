# ការកំណត់ Connection រវាង Mobile App និង Backend ASP.NET Core

> កំណត់ត្រាការផ្លាស់ប្តូរ config ដើម្បីឱ្យ Flutter app ភ្ជាប់ទៅ backend `apimisteams`
> បានគ្រប់ platform — **Android emulator**, **Web (Chrome)**, និង **Real phone**.
>
> កាលបរិច្ឆេទ៖ 2026-10-01

---

## 🎯 បញ្ហាដើម

- Backend ដំណើរការលើ `https://localhost:7124` (self-signed dev certificate)។
- Mobile app តម្រង់ទៅ `http://` (scheme ខុស) → ភ្ជាប់មិនបាន។
- `localhost` មិនដំណើរការលើ emulator និង real phone។
- CORS backend អនុញ្ញាតតែ URL API ខ្លួនឯង → Flutter Web ត្រូវ browser block។

---

## 📱 ១. ផ្នែក MOBILE (`D:\MIS_MOBILE_APP\mobile_misteams`)

### 🆕 File បង្កើតថ្មី (៣)

| File | តួនាទី |
|------|--------|
| `lib/core/network/dev_http_overrides.dart` | ជ្រើស implementation តាម platform (conditional import) |
| `lib/core/network/dev_http_overrides_io.dart` | Mobile/Desktop — ទទួលយក self-signed cert **ពេល debug mode តែប៉ុណ្ណោះ** |
| `lib/core/network/dev_http_overrides_web.dart` | Web — no-op (browser គ្រប់គ្រង TLS ខ្លួនឯង) |

**ហេតុអ្វី៖** backend ប្រើ self-signed HTTPS certificate។ Flutter លើ mobile/desktop
បដិសេធ cert បែបនេះ (`HandshakeException`)។ Code ថ្មីនេះធ្វើឱ្យ app ទទួលយក cert
**តែក្នុង debug build** (guard ដោយ `kDebugMode`) — មិនប៉ះពាល់ release ឬ web។

### ✏️ File កែ (២)

| File | ការផ្លាស់ប្តូរ |
|------|----------------|
| `lib/main.dart` | បន្ថែម `import 'core/network/dev_http_overrides.dart';` និងហៅ `installDevHttpOverrides();` នៅដើម `main()` (មុន request ដំបូង) |
| `lib/core/constants/api_constants.dart` | ប្តូរ scheme `http://` → `https://` គ្រប់ platform (web / android `10.0.2.2` / desktop) |

**`api_constants.dart` resolve host ស្វ័យប្រវត្តិ៖**
- Web (Chrome) → `https://localhost:7124`
- Android emulator → `https://10.0.2.2:7124`
- Desktop/iOS sim → `https://localhost:7124`
- Real phone → override ពេល run (មើលផ្នែក "របៀប Run")

---

## 🖥️ ២. ផ្នែក BACKEND (`D:\MIS_MOBILE_APP\apimisteams`)

### ✏️ File កែ (៣)

#### (a) `Properties/launchSettings.json`
Profile `https` → `applicationUrl` ប្តូរពី៖
```
https://localhost:7124;http://localhost:5030
```
ទៅ៖
```
https://0.0.0.0:7124;http://0.0.0.0:5030
```
**ហេតុអ្វី៖** `0.0.0.0` = listen គ្រប់ network interface → emulator និង real phone ភ្ជាប់បាន។

> ⚠️ Visual Studio អាច rewrite file នេះដោយស្វ័យប្រវត្តិ។ បើការកែបាត់ សូមកែម្តងទៀត
> ឬកែពី VS (Project → Properties → Debug → Launch Profiles)។

#### (b) `appsettings.json`
ផ្នែក `Cors` ប្តូរពី៖
```json
"AllowedOrigins": [ "https://localhost:7124", "https://localhost:7124" ]
```
ទៅ៖
```json
"AllowedOrigins": [ "*" ]
```
**ហេតុអ្វី៖** ឱ្យ Flutter Web (origin ផ្សេង) ហៅ API បាន។ `"*"` សម្រាប់ **dev តែប៉ុណ្ណោះ**។

#### (c) `Program.cs` (ប្រហែលបន្ទាត់ 165–184)
CORS policy "Default" កែឱ្យគាំទ្រ `"*"`៖
```csharp
if (allowedOrigins.Contains("*"))
{
    policyBuilder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader();
}
else
{
    policyBuilder
        .WithOrigins(allowedOrigins)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
}
```
**ហេតុអ្វី៖** `AllowAnyOrigin()` មិនអាចផ្សំជាមួយ `AllowCredentials()`។ App ប្រើ
**Bearer token** (Authorization header) មិនមែន cookie ទេ ដូច្នេះមិនត្រូវការ credentials។

> `app.UseCors("Default")` នៅ `Program.cs` ស្ថិតមុន `UseAuthentication` រួចហើយ (order ត្រឹមត្រូវ)។

---

## ▶️ របៀប Run

### Backend (ត្រូវ restart បន្ទាប់ពីកែ config)
```powershell
cd D:\MIS_MOBILE_APP\apimisteams
dotnet run --launch-profile https
```
ជោគជ័យបើឃើញ៖ `Now listening on: https://0.0.0.0:7124`

### Flutter (ជ្រើសតាម platform)
```powershell
# Android emulator  → auto 10.0.2.2:7124
flutter run -d emulator-5554

# Web (Chrome)  → auto localhost:7124
# (បើក https://localhost:7124 ក្នុង Chrome ម្តងជាមុន → Advanced → Proceed ដើម្បី accept cert)
flutter run -d chrome --web-port=5000

# Real phone  → ប្តូរ 192.168.x.x ទៅ IPv4 ម៉ាស៊ីន (រកដោយ ipconfig)
flutter run --dart-define=API_BASE_URL=https://192.168.x.x:7124
```

### Real phone បន្ថែម — បើក Windows Firewall (ម្តងគត់)
```powershell
New-NetFirewallRule -DisplayName "ASP.NET Dev 7124" -Direction Inbound -LocalPort 7124 -Protocol TCP -Action Allow
```
> Phone និង PC ត្រូវនៅ WiFi តែមួយ។

---

## ⚠️ ចំណុចនៅសល់ត្រូវធ្វើ

1. **SDK version** — `pubspec.yaml` ទាមទារ Dart `^3.12.2` តែម៉ាស៊ីនមាន 3.11.4។
   ត្រូវ `flutter upgrade` ឬបន្ថយ constraint បើមិនដូច្នោះ `flutter pub get` បរាជ័យ។

2. **🔐 Secrets លេចធ្លាយ** — `appsettings.json` មាន secret ពិត (DB password, JWT secret,
   DigitalOcean keys, Google ClientSecret, Gmail password)។
   - ត្រូវ **ប្តូរ (rotate)** secret ទាំងនេះ។
   - ប្រើ **User Secrets** / environment variables ជំនួស។
   - **កុំ commit** `appsettings.json` ដែលមាន secret ទៅ git។

3. **`"*"` CORS និង cert bypass** — សម្រាប់ **DEV តែប៉ុណ្ណោះ**។ ពេល production ត្រូវ៖
   - ដាក់ origin ពិតក្នុង `AllowedOrigins`។
   - ប្រើ certificate ត្រឹមត្រូវ (មិនមែន self-signed)។
   - cert bypass លើ mobile គ្មានប៉ះពាល់ release build (guard ដោយ `kDebugMode`)។
