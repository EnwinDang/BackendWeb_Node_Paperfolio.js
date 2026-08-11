const db = require('./index');

const assets = [
  { name: 'Bitcoin', symbol: 'BTC', category: 'Layer 1', current_price: 62000 },
  { name: 'Ethereum', symbol: 'ETH', category: 'Layer 1', current_price: 3400 },
  { name: 'BNB', symbol: 'BNB', category: 'Exchange Token', current_price: 580 },
  { name: 'Solana', symbol: 'SOL', category: 'Layer 1', current_price: 145 },
  { name: 'XRP', symbol: 'XRP', category: 'Payments', current_price: 0.52 },
  { name: 'Cardano', symbol: 'ADA', category: 'Layer 1', current_price: 0.45 }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO assets (name, symbol, category, current_price)
  VALUES (@name, @symbol, @category, @current_price)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

insertMany(assets);

console.log(`Seeded ${assets.length} assets (existing rows left untouched).`);
