# Agenda do Camionista
Ter opcoa de criar uma conta
Multi Linguagens
Esqueceu a senha
Receber emails transacionais


App para motoristas de pesados registarem o dia de trabalho (partidas, pausas,
repousos, cargas, descargas, abastecimentos) e acompanharem os limites do
Regulamento (CE) 561/2006: amplitude, reduzidas, repouso semanal,
compensações e horas de condução.

Feita em **Expo (React Native)** a partir da app original em Swift, com o
mesmo aspeto e a mesma lógica, para correr em **iPhone e Android**.

---

## Começar

```bash
npm install
npx expo start          # abre o servidor de desenvolvimento (Expo Go ou dev build)
```

| Comando | O que faz |
|---|---|
| `npm test` | Testes das regras de negócio (`tests/`) |
| `npx tsc --noEmit` | Verificação de tipos |
| `npx expo lint` | ESLint (config `eslint-config-expo`) |
| `npx expo run:ios --device` | Compila e instala no iPhone ligado por cabo |
| `npx expo run:ios --device --configuration Release` | Idem, versão final (funciona sem o Mac) |
| `npx eas-cli@latest build -p android` | Gera o APK/AAB Android na cloud |

> As pastas `ios/` e `android/` são geradas (`npx expo prebuild`) e não estão
> no repositório. Toda a configuração nativa está em `app.json`.

### Configuração

- **Backend**: `BASE_URL` em [`src/api/client.ts`](src/api/client.ts) (HTTP; o
  `app.json` permite tráfego não-HTTPS no iOS e no Android).
- **Identificador iOS**: `snitram.Agenda-do-Caminhonista-Expo` (instala ao lado
  da app Swift). Para substituir a app Swift, usar
  `snitram.Agenda-do-Caminhonista-IOS`.
- **Android / mapas**: para builds de produção é preciso uma chave da API do
  Google Maps (`android.config.googleMaps.apiKey` no `app.json`).

---

## Arquitetura

Organização por camadas e por funcionalidade. Ver
[`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) para o detalhe e as regras.

```
src/
├── app/        Rotas (Expo Router). Ficheiros finos: só ligam parâmetros ao ecrã.
├── features/   Uma pasta por funcionalidade: Ecrã + components/ + hooks/
│   ├── auth/         Login (senha, Face ID / impressão digital) e criar conta
│   ├── home/         Início (cartões, avisos, lista de dias, pesquisa)
│   ├── day/          Ecrã do dia (Geral / Ações / Fotos) e PDF "Resumo do dia"
│   ├── actions/      Criar / editar ação (localização, campos extra)
│   ├── settings/     Ajustes
│   ├── drivingHours/ Condução semanal
│   ├── worksheet/    Folha de serviço (PDF Agrotir, CSV)
│   ├── map/          Mapa do dia
│   └── photo/        Foto em ecrã inteiro
├── domain/     Regras de negócio PURAS (sem React) — testadas em tests/
├── api/        Cliente HTTP + um módulo por recurso (auth, days, actions, settings)
├── stores/     Estado global (zustand): dias, definições, sessão, compensações
├── storage/    Cache local dos dias (days.json) e backup JSON
├── i18n/       Traduções (pt = fonte de verdade, es) — ver "Idiomas"
├── ui/         Design system: tema, ícones, cartões, botões, menus, seletores
├── hooks/      Hooks genéricos (hora atual, altura do teclado)
├── lib/        Utilitários genéricos (fusos/datas, números, PDF)
├── types/      Modelos da API
└── assets/     Recursos embutidos (logótipo do PDF)
```

Fluxo de dados:

```
 ecrã (features/*)  ──lê──▶  stores/daysStore  ◀──grava── api/* + storage/daysCache
        │                          │
        └──── usa ──▶ domain/* (regras puras: semana, repousos, amplitude…)
```

---

## Regras de negócio

Todas em `src/domain/`, documentadas no próprio código e cobertas por testes.

| Regra | Onde |
|---|---|
| Tipos de ação, nomes apresentados, durações | `domain/actionTypes.ts` |
| Dia em aberto, trajeto, "Termina: …", amplitude 13H/15H | `domain/days.ts` |
| Repouso fracionado 3+9 | `domain/fractionedRest.ts` |
| Contadores da semana, dia em curso, prazo do repouso semanal, avisos, pesquisa | `domain/week.ts` |
| Repouso real, etiquetas "Real: …", compensações automáticas, repouso em curso | `domain/restTracking.ts` |
| Regra das 3 reduzidas (limite 13h, Repouso 9H indisponível) | `domain/amplitude.ts` |
| Folha de serviço (períodos, linhas por dia, carga ↔ descarga em todo o histórico, km do dia, avisos) | `features/worksheet/worksheetModel.ts` |

### Criar conta

`POST /users` (nome, e-mail, senha) e, a seguir, login automático. O backend
responde com corpo vazio — sem erro — quando o e-mail já existe; a app trata
isso como "não foi possível criar a conta" (ver `api/auth.ts`).

### Esqueceu a senha

Em 2 passos (`features/auth/ForgotPasswordScreen.tsx`): email →
`POST /users/forgot-password` (o backend envia um código de 6 dígitos por
email); código + nova senha → `POST /users/reset-password`, e a app entra logo
na conta. O idioma da app é enviado para os emails virem no mesmo idioma.
Ver `EMAILS.md` no repositório do backend.

### Idiomas

Português e espanhol. Por omissão segue o idioma do telemóvel; em Ajustes →
IDIOMA pode escolher-se Automático / Português / Español.

- Textos em `src/i18n/pt/*.ts` (fonte de verdade) e `src/i18n/es/*.ts`, um
  ficheiro por área (home, day, actions…). O TypeScript obriga o espanhol a
  ter as mesmas chaves.
- Componentes: `const s = useStrings()` → `s.home.newDay`. Fora de
  componentes: `strings()`.
- Datas: nomes de dias/meses em `lib/timezone.ts`; `dateLocale()` escolhe o
  locale certo.
- Textos das permissões do iOS: `locales/pt.json` e `locales/es.json`.
- **A folha de serviço em PDF/CSV fica sempre em português** (modelo oficial
  Agrotir).

Para acrescentar um idioma: copiar `src/i18n/es/` para `src/i18n/<código>/`,
traduzir, registar em `src/i18n/index.ts` e em `LANGUAGE_PREFERENCES`
(`stores/settingsStore.ts`).

### Fuso horário

Datas até 25/09/2026 são mostradas em hora de Lisboa; a partir daí no fuso
escolhido em Ajustes (Lisboa ou Madrid). Ver `lib/dateFormat.ts`.

### Dados locais

- `Documents/days.json` — cópia de todos os dias (a app abre sem rede).
  Campos que o backend ainda não devolve (cliente, km, combustível…) são
  preservados ao juntar com a resposta do servidor.
- AsyncStorage — fuso escolhido, última unidade de descarga, compensações
  marcadas como "Feita".
- Keychain / Keystore — e-mail e senha para entrar com biometria (só se o
  utilizador aceitar).

---

## Testes

`tests/*.test.ts` correm com o test runner do Node (`npm test`) e cobrem as
regras de `domain/`:

- `restTracking.test.ts` — repouso real, compensação (17h, "contou como
  normal", paga sozinha, continua pendente, incompleto, prazos).
- `amplitude.test.ts` — regra das 3 reduzidas (limite 19:00 / 21:00, 9H
  indisponível, fracionado não conta, repõe após repouso semanal).
- `registration.test.ts` — validação do formulário "Criar conta".
- `passwordReset.test.ts` — validação do "Esqueceu a senha".
- `worksheet.test.ts` — folha de serviço: linhas por dia (carga de outro
  dia/mês, carga por descarregar, ordem por hora), km do dia e aviso
  "Falta o km final do dia X".
