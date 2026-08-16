# Price Alerts API

Een database-driven REST API voor het bijhouden van cryptomunten en het instellen van
prijsalerts, gebouwd met Node.js en Express.

## Over het Project

Deze API laat toe om assets (cryptomunten) bij te houden en price alerts in te stellen:
"waarschuw mij wanneer asset X een bepaalde prijs bereikt". Het is een standalone
project met zijn eigen SQLite-database — het werkt volledig op zichzelf, maar kan ook
gekoppeld worden aan een apart Laravel-project (PaperFolio) dat deze API als client
gebruikt.

## Vereisten

- Node.js >= 20
- npm

## Installatie

### Stap 1: Clone de Repository
```bash
git clone <repository-url>
cd price-alerts-api
```

### Stap 2: Installeer Dependencies
```bash
npm install
```

### Stap 3: Kopieer Environment File
```bash
cp .env.example .env
```

### Stap 4: Configureer de API Key
Open `.env` en zet `API_KEY` op een geheime string naar keuze:
```env
PORT=4000
API_KEY=jouw-eigen-geheime-sleutel
```

## Database Setup

### Stap 1: Zaai de Database
Dit maakt `data.sqlite` aan en vult die met 6 voorbeeld-assets (BTC, ETH, BNB, SOL, XRP, ADA):
```bash
npm run seed
```

### Stap 2: Start de Server
```bash
npm run dev
```

De API draait nu op `http://localhost:4000`. Ga naar `http://localhost:4000/` voor de
volledige documentatie van alle endpoints, met voorbeelden.

## Authenticatie

Stuur de key mee als header: `x-api-key: <jouw API_KEY uit .env>`

- `/assets`: lezen (`GET`) is publiek, schrijven (`POST`/`PUT`/`DELETE`) vereist de key
- `/alerts`: alles vereist de key, ook lezen — een alert bevat een persoonlijk e-mailadres

## Endpoints

| Methode | Pad            | Auth      | Opmerkingen |
|---------|----------------|-----------|-------------|
| GET     | /assets        | publiek   | paginatie (`limit`/`offset`), zoeken (`name`/`symbol`), sorteren |
| GET     | /assets/:id    | publiek   | |
| POST    | /assets        | API key   | |
| PUT     | /assets/:id    | API key   | prijswijziging triggert alert-evaluatie |
| DELETE  | /assets/:id    | API key   | |
| GET     | /alerts        | API key   | paginatie, zoeken (`email`/`asset_id`/`direction`/`is_triggered`), sorteren |
| GET     | /alerts/:id    | API key   | |
| POST    | /alerts        | API key   | geavanceerde validatie, zie hieronder |
| PUT     | /alerts/:id    | API key   | |
| DELETE  | /alerts/:id    | API key   | |

## Features

### Basisfunctionaliteit
- Volledige CRUD voor twee entiteiten: assets en price alerts
- Paginatie via `limit` en `offset`
- Zoeken op één of meerdere velden
- Root-pagina (`/`) met volledige documentatie van alle endpoints

### Validatie
- Basis: verplichte velden, `assets.name` weigert cijfers, `assets.symbol` moet
  `^[A-Z]{2,10}$` volgen, `price_alerts.email` moet een geldig e-mailadres zijn
- Geavanceerd: de doelprijs van een alert wordt vergeleken met de huidige prijs van de
  asset — bij `direction: "above"` moet de doelprijs hoger liggen dan de huidige prijs,
  bij `"below"` lager. Anders wordt de alert geweigerd als onlogisch

### Extra Features
- Sorteren van resultaten (`sort=veld` of `sort=-veld` voor aflopend)
- Zoeken op meerdere velden tegelijk (bv. `direction` + `is_triggered` bij alerts)
- Resultaten beperken tot geauthenticeerde gebruikers: bij `/alerts` is zelfs lezen
  afgeschermd met een API key, aangezien een alert een persoonlijk e-mailadres bevat
- Prijswijzigingen op een asset (`PUT /assets/:id`) triggeren automatisch de evaluatie
  van alle openstaande alerts op die asset — geen apart endpoint nodig

## Projectstructuur

```
db/
  index.js          opent data.sqlite, maakt tabellen aan indien nog niet aanwezig
  seed.js            zaait 6 voorbeeld-assets
validation/
  helpers.js          kleine pure hulpfuncties (isNotEmpty, isValidNumber, ...)
  assetValidation.js  validatie voor assets
  alertValidation.js  validatie voor alerts, incl. de cross-field regel en de check
                       of de asset bestaat (vereist een DB-lookup)
middleware/
  auth.js             controleert de x-api-key header
  errorHandler.js     globale Express error handler -> nette JSON-fouten i.p.v.
                       Express' standaard HTML stack-trace pagina
routes/
  assets.js
  alerts.js
public/
  index.html          de documentatiepagina op de root
server.js             koppelt alles aan elkaar
```

## Ontwerpkeuzes

- **better-sqlite3, geen ORM**: synchroon en zonder configuratie, voldoende voor twee
  tabellen — een ORM zou hier enkel indirectie toevoegen zonder iets duidelijker te
  maken.
- **CommonJS** (`require`/`module.exports`) in plaats van ESM, om het simpel te houden.
- Route handlers gebruiken geen `try/catch` per stuk: better-sqlite3 is volledig
  synchroon, en Express stuurt een synchrone fout automatisch door naar
  `middleware/errorHandler.js`.

## Technologieën

- Node.js (v20+)
- Express
- better-sqlite3 (synchrone SQLite-driver, geen ORM)

## Bronvermeldingen

### Documentatie
- Express: https://expressjs.com/
- better-sqlite3: https://github.com/WiseLibs/better-sqlite3

### AI Assistentie
**Claude (Anthropic)**
- Gebruikt voor ondersteuning bij projectontwikkeling
- Specifieke hulp bij: opzetten van het project, implementatie van routes/validatie/
  middleware, debuggen, en het live testen van elk endpoint

## Licentie

MIT — zie `LICENSE`.
