# Price Alerts API

Een database-driven REST API voor het bijhouden van cryptomunten en het instellen van
prijsalerts. Standalone project — gebruikt geen gedeelde database met project 1
(PaperFolio), maar kan er wel mee gekoppeld worden.

## Aan de slag

```bash
npm install
cp .env.example .env
# zet API_KEY in .env op een geheime string naar keuze
npm run seed   # zaait 6 voorbeeld-assets (BTC, ETH, BNB, SOL, XRP, ADA)
npm run dev
```

De server draait op `http://localhost:4000`. Ga naar `http://localhost:4000/` voor de
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

## Validatie

Basis: verplichte velden, geen cijfers in `assets.name`, `assets.symbol` moet
`^[A-Z]{2,10}$` volgen, geldig e-mailadres voor alerts.

Geavanceerd: de doelprijs van een alert moet logisch zijn tegenover de huidige prijs van
de asset — bij `direction: "above"` moet de doelprijs hoger liggen, bij `"below"` lager.
Anders wordt de alert geweigerd.

## Bronnen

- Express documentatie — https://expressjs.com/
- better-sqlite3 documentatie — https://github.com/WiseLibs/better-sqlite3

## Built With

* [Node.js](https://nodejs.org) — runtime (v20+)
* [Express](https://expressjs.com) — web framework
* [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — database, synchroon, geen ORM
* **Claude (Anthropic)** — hielp bij het opzetten van het project, het implementeren van
  routes/validatie/middleware, debuggen, en het testen van elk endpoint

## Licentie

MIT — zie `LICENSE`.
