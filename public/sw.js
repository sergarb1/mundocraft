/* MundoCraft service worker: offline support with a small runtime cache. */
const CACHE = 'mundocraft-v6'
const ART = [
  'art/blocks/grass_top.png',
  'art/blocks/dirt.png',
  'art/blocks/stone.png',
  'art/blocks/cobblestone.png',
  'art/blocks/oak_planks.png',
  'art/blocks/oak_leaves.png',
  'art/blocks/water.png',
  'art/blocks/sand.png',
  'art/blocks/bricks.png',
  'art/blocks/farmland.png',
  'art/cubes/gold_block.png',
  'art/cubes/bookshelf.png',
  'art/cubes/hay.png',
  'art/cubes/crafting_table.png',
  'art/cubes/grass.png',
  'art/cubes/dirt.png',
  'art/cubes/stone.png',
  'art/cubes/cobblestone.png',
  'art/cubes/oak_planks.png',
  'art/cubes/oak_leaves.png',
  'art/cubes/water.png',
  'art/cubes/sand.png',
  'art/cubes/bricks.png',
  'art/farm/chicken.png',
  'art/farm/cow.png',
  'art/farm/sheep.png',
  'art/farm/carrot.png',
  'art/farm/corn.png',
  'art/farm/tomato.png',
  'art/farm/sunflower.png',
  'art/farm/eggplant.png',
  'art/farm/cabbage.png',
  'art/farm/potato.png',
  'art/farm/pickaxe.png',
]
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  ...ART,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // App navigations: network first, cached shell as offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy))
          return response
        })
        .catch(() => caches.match('./index.html')),
    )
    return
  }

  // Static assets: cache first, then network, then cache the new file.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
