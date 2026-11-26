# Arquitetura

Este documento explica como o código está organizado e as convenções a
seguir ao acrescentar funcionalidades.

## Camadas

```
app/  ──▶  features/  ──▶  stores/ · api/ · storage/  ──▶  domain/ · lib/ · types/
                 └──────────▶  ui/ · hooks/
```

Uma camada só importa das camadas à sua direita. Em particular:

- **`domain/`** e **`lib/`** não importam React, React Native, stores nem
  armazenamento. São funções puras, fáceis de testar em Node.
- **`ui/`** não conhece regras de negócio: só recebe dados por props.
- **`app/`** não tem lógica: lê os parâmetros da rota e mostra o ecrã.

### `app/` — rotas

Expo Router: cada ficheiro é uma rota. A forma de apresentação (página,
modal, folha) está declarada em `app/_layout.tsx`.

| Rota | Ecrã | Apresentação |
|---|---|---|
| `/` | Login → Início | página |
| `/register` | Criar conta | modal |
| `/forgot-password` | Esqueceu a senha | modal |
| `/day/[id]?initialTab=` | Dia (Geral / Ações / Fotos) | página |
| `/create-action?dayId=` | Criar ação | modal |
| `/edit-action?dayId=&actionId=` | Editar ação | modal |
| `/settings` | Ajustes | modal |
| `/weekly-hours` | Condução semanal | modal |
| `/worksheet` | Folha de serviço (datas De / Até) | modal |
| `/map?dayId=` | Mapa do dia | folha |
| `/photo?dayId=&name=&url=` | Foto | modal escuro |

### `features/` — funcionalidades

Cada pasta segue o mesmo padrão:

```
features/<nome>/
├── <Nome>Screen.tsx     ecrã: compõe componentes, sem lógica de negócio
├── components/          componentes só desta funcionalidade
├── hooks/               estado e efeitos (useXxx), ex.: carregar, gravar
└── *.ts                 lógica sem UI desta funcionalidade (ex.: actionForm.ts)
```

- A lógica de estado e chamadas à API vive em **hooks** (`useDayForm`,
  `useCreateAction`, `useLogin`, `useWorkSheet`…). O ecrã só desenha.
- Componentes usam **`StyleSheet.create`**; estilos dinâmicos (cor, posição)
  vão em arrays `[styles.x, { … }]`.

### `stores/` — estado global (zustand)

| Store | Conteúdo |
|---|---|
| `daysStore` | dias (fonte única de verdade), contadores da semana, horas de condução, pesquisa |
| `settingsStore` | fuso horário (persistido) |
| `authStore` | token e utilizador (só em memória) |
| `compensationStore` | compensações marcadas como "Feita" (persistido) |

Regra: **todas as alterações a um dia passam por `daysStore`**
(`updateDay`, `addAction`, `replaceAction`, `removeAction`), que recalcula
os contadores e grava a cache local. Assim o Início, o ecrã do dia e o mapa
mostram sempre o mesmo.

Para ler o estado fora de componentes: `useDaysStore.getState()`,
`getAuthToken()`, `currentTimeZoneId()`.

### `api/` — backend

`client.ts` tem `request` / `requestVoid` / `uploadFiles` e converte todos os
erros em `ApiError` (com a mensagem do backend). Cada recurso tem o seu
módulo com funções nomeadas pelo que fazem (`fetchDays`, `updateDay`,
`createAction`…). O token é lido do `authStore`.

### `domain/` — regras de negócio

Funções puras que recebem os dias (e o fuso, quando relevante) e devolvem
resultados. Os nomes estão em inglês; o vocabulário do domínio:

| Código | Português |
|---|---|
| departure | Partida |
| reduced rest | reduzida (Repouso 9H não fracionado) |
| three-hour rest / fractioned | Repouso 3H+ / fracionado 3+9 |
| weekly rest | repouso semanal (24H / 45H) |
| compensation | compensação do repouso semanal reduzido |
| real rest (`RestPeriod.realMs`) | repouso real (até à Partida seguinte) |
| counted as weekly (`RestPeriod.countedAsWeekly`) | 9H/11H que durou 24h+ até à Partida e conta como semanal (reduzido/normal) |
| day limit / amplitude | amplitude (Partida + 13h/15h) |
| week counters | contadores "ESTA SEMANA" |

Os identificadores das ações (`'Pausa 9H'`, `'Repouso 3H+'`…) são os valores
da API e ficam em português; os nomes mostrados vêm de `actionDisplayName`.

### `lib/` — utilitários

- `timezone.ts` — calendário com fuso explícito e formatação com nomes PT
  próprios (resultado igual em iOS e Android).
- `dateFormat.ts` — `formatAppDate` (regra da data de corte do fuso),
  conversões ISO. O fuso vem de um *provider* registado pelo `settingsStore`.
- `numbers.ts` — leitura/formatação pt_PT ("46 610", "511,79").
- `pdf.ts` — desenho de PDFs com HTML posicionado em pontos.

### `i18n/` — traduções

Dicionários por idioma (`pt/`, `es/`), um ficheiro por área. Regras:

- Nenhum texto visível escrito diretamente nos componentes: vai para
  `i18n/pt/<área>.ts` e a tradução para `i18n/es/<área>.ts`.
- Textos com variáveis são funções (`leaveAt: (when) => …`).
- `useStrings()` em componentes; `strings()` em regras, alertas e PDFs.
- `domain/` e `lib/` podem usar `strings()` (é TypeScript puro): o idioma
  vem de um *provider* registado pelo `settingsStore`, como o fuso horário.
- Os identificadores das ações e o PDF/CSV da folha de serviço ficam em
  português.

### `ui/` — design system

`theme.ts` (cores, tamanhos de letra, sombra, `cardStyle`), `primitives.tsx`
(`Card`, `SectionLabel`, `SectionHeader`, `ProgressBar`, `Divider`, `Dot`,
`Tag`, `PrimaryButton`, `FloatingActionButton`, `EmptyState`), `menus.tsx`
(`openMenu`, `ToolbarButton`, `MenuPickerButton`), `Icon`, `Segmented`,
`TimePicker`.

Ícones usam nomes de SF Symbols; no Android são traduzidos para Material
Community Icons em `ui/Icon.tsx` (acrescentar lá ao usar um ícone novo).

## Como acrescentar…

- **Uma regra nova** → função pura em `domain/` + teste em `tests/`.
- **Um ecrã novo** → `features/<nome>/<Nome>Screen.tsx` + rota fina em `app/`
  + opções de apresentação em `app/_layout.tsx`.
- **Um endpoint** → função em `api/<recurso>.ts`.
- **Estado partilhado entre ecrãs** → `stores/`; estado só de um ecrã → hook
  na própria feature.

## Verificações antes de entregar

```bash
npx expo lint && npx tsc --noEmit && npm test
```
