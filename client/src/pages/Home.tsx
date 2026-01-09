/**
 * Home pagina - API Documentatie overzicht
 * Toont een overzicht van alle beschikbare API endpoints
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="container py-8">
          <h1 className="text-4xl font-bold mb-2">Products & Categories API</h1>
          <p className="text-slate-400 text-lg">
            RESTful API voor het beheren van producten en categorieën
          </p>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Overzicht */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Overzicht</h2>
            <p className="text-slate-300 mb-4">
              Deze API biedt volledige CRUD functionaliteit voor twee entiteiten:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Categorieën beheer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Producten beheer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Paginatie ondersteuning
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Zoekfunctionaliteit
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Uitgebreide validatie
              </li>
            </ul>
          </section>

          {/* Base URL */}
          <section className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">Base URL</h2>
            <code className="block bg-slate-900 p-4 rounded text-green-400 font-mono">
              /api
            </code>
            <p className="text-slate-400 mt-4 text-sm">
              Alle endpoints beginnen met deze base URL
            </p>
            <a
              href="/api-docs.html"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
            >
              Volledige Documentatie →
            </a>
          </section>
        </div>

        {/* Categorieën Endpoints */}
        <section className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            Categorieën Endpoints
          </h2>
          <div className="space-y-4">
            <EndpointRow method="GET" url="/api/categories" description="Alle categorieën ophalen" />
            <EndpointRow method="GET" url="/api/categories/paginated" description="Categorieën met paginatie" />
            <EndpointRow method="GET" url="/api/categories/search?q=term" description="Zoeken in categorieën" />
            <EndpointRow method="GET" url="/api/categories/:id" description="Specifieke categorie ophalen" />
            <EndpointRow method="POST" url="/api/categories" description="Nieuwe categorie aanmaken" />
            <EndpointRow method="PUT" url="/api/categories/:id" description="Categorie volledig updaten" />
            <EndpointRow method="PATCH" url="/api/categories/:id" description="Categorie gedeeltelijk updaten" />
            <EndpointRow method="DELETE" url="/api/categories/:id" description="Categorie verwijderen" />
          </div>
        </section>

        {/* Producten Endpoints */}
        <section className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            Producten Endpoints
          </h2>
          <div className="space-y-4">
            <EndpointRow method="GET" url="/api/products" description="Alle producten ophalen" />
            <EndpointRow method="GET" url="/api/products/paginated" description="Producten met paginatie" />
            <EndpointRow method="GET" url="/api/products/search?q=term" description="Zoeken in producten" />
            <EndpointRow method="GET" url="/api/products/category/:id" description="Producten per categorie" />
            <EndpointRow method="GET" url="/api/products/:id" description="Specifiek product ophalen" />
            <EndpointRow method="POST" url="/api/products" description="Nieuw product aanmaken" />
            <EndpointRow method="PUT" url="/api/products/:id" description="Product volledig updaten" />
            <EndpointRow method="PATCH" url="/api/products/:id" description="Product gedeeltelijk updaten" />
            <EndpointRow method="DELETE" url="/api/products/:id" description="Product verwijderen" />
          </div>
        </section>

        {/* Validatie */}
        <section className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            Validatie Regels
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-slate-900 p-4 rounded">
              <h3 className="font-semibold text-white mb-2">Categorieën</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Naam is verplicht</li>
                <li>• Naam mag geen cijfers bevatten</li>
                <li>• Beschrijving is optioneel</li>
              </ul>
            </div>
            <div className="bg-slate-900 p-4 rounded">
              <h3 className="font-semibold text-white mb-2">Producten</h3>
              <ul className="text-slate-400 text-sm space-y-1">
                <li>• Naam is verplicht, geen cijfers</li>
                <li>• Prijs moet positief zijn</li>
                <li>• Voorraad mag niet negatief zijn</li>
                <li>• CategoryId moet bestaan</li>
              </ul>
            </div>
          </div>
        </section>

        {/* HTTP Status Codes */}
        <section className="mt-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            HTTP Status Codes
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <StatusCode code="200" label="OK" description="Succesvolle request" />
            <StatusCode code="201" label="Created" description="Resource aangemaakt" />
            <StatusCode code="400" label="Bad Request" description="Validatiefout" />
            <StatusCode code="404" label="Not Found" description="Niet gevonden" />
            <StatusCode code="500" label="Server Error" description="Server fout" />
          </div>
        </section>
      </main>

      <footer className="bg-slate-800 border-t border-slate-700 py-6 mt-12">
        <div className="container text-center text-slate-400">
          <p>Products & Categories API - Node.js + Express + Drizzle ORM</p>
        </div>
      </footer>
    </div>
  );
}

function EndpointRow({ method, url, description }: { method: string; url: string; description: string }) {
  const methodColors: Record<string, string> = {
    GET: "bg-green-600",
    POST: "bg-yellow-600",
    PUT: "bg-blue-600",
    PATCH: "bg-purple-600",
    DELETE: "bg-red-600",
  };

  return (
    <div className="flex items-center gap-4 bg-slate-900 p-3 rounded">
      <span className={`${methodColors[method]} px-3 py-1 rounded text-xs font-bold min-w-[70px] text-center`}>
        {method}
      </span>
      <code className="text-green-400 font-mono text-sm flex-1">{url}</code>
      <span className="text-slate-400 text-sm hidden md:block">{description}</span>
    </div>
  );
}

function StatusCode({ code, label, description }: { code: string; label: string; description: string }) {
  return (
    <div className="bg-slate-900 p-3 rounded">
      <span className="text-blue-400 font-mono font-bold">{code}</span>
      <span className="text-white ml-2">{label}</span>
      <p className="text-slate-500 text-sm mt-1">{description}</p>
    </div>
  );
}
