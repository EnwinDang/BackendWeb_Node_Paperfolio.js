# Product API

Een RESTful API gebouwd met **Node.js**, **Express** en **Drizzle ORM** voor het beheren van **producten** en **categorieën**.  
De API ondersteunt **CRUD-operaties**, **paginatie**, **zoekfunctionaliteit** en **server-side validatie**.

---

## Features
- CRUD voor producten en categorieën
- Paginatie met `limit` en `offset`
- Zoeken op naam
- Validatie van invoer
- MySQL-database via Drizzle ORM
- RESTful structuur

---

## Vereisten
- Node.js (v18 of hoger)
- MySQL

---

## Installatie

```bash
npm install
```

Maak een `.env` bestand:
```
DATABASE_URL=mysql://user:wachtwoord@localhost:3306/database
```

Database setup:
```
npm run db:push
```

Starten:
```
npm run dev
```

## Endpoints

### Categorieën
- GET /api/categories - alle categorieën
- GET /api/categories/:id - 1 categorie
- POST /api/categories - nieuwe categorie
- PUT /api/categories/:id - update categorie
- DELETE /api/categories/:id - verwijder categorie
- GET /api/categories/paginated?limit=10&offset=0 - met paginatie
- GET /api/categories/search?q=zoekterm - zoeken

### Producten
- GET /api/products - alle producten
- GET /api/products/:id - 1 product
- POST /api/products - nieuw product
- PUT /api/products/:id - update product
- DELETE /api/products/:id - verwijder product
- GET /api/products/paginated?limit=10&offset=0 - met paginatie
- GET /api/products/search?q=zoekterm - zoeken

## Voorbeeld

Categorie maken:
```json
POST /api/categories
{
  "name": "Elektronica",
  "description": "Computers en telefoons"
}
```

Product maken:
```json
POST /api/products
{
  "name": "Laptop",
  "price": 500,
  "stock": 10,
  "categoryId": 1
}
```

## Validatie

- naam mag niet leeg zijn
- naam mag geen nummers hebben
- prijs moet positief zijn
- stock mag niet negatief zijn

## Bronnen

- https://expressjs.com/
- https://orm.drizzle.team/
- https://stackoverflow.com/
