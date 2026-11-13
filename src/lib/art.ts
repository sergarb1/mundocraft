const BASE = import.meta.env.BASE_URL

/** Textura 16x16 de un bloque (césped, tierra, piedra...). */
export const tex = (name: string) => `${BASE}art/blocks/${name}.png`

/** Algunos ids de bloque no coinciden con el nombre del archivo. */
export const blockTex = (id: string) => tex(id === 'grass' ? 'grass_top' : id)

/** Cubo isométrico de un bloque, para carteles y paletas. */
export const cubeArt = (name: string) => `${BASE}art/cubes/${name}.png`

/** Sprite CC0 de Kenney Tiny Farm. */
export const farmArt = (name: string) => `${BASE}art/farm/${name}.png`

export const FARM_ITEMS = [
  'chicken',
  'cow',
  'sheep',
  'carrot',
  'corn',
  'tomato',
  'sunflower',
  'eggplant',
  'cabbage',
  'potato',
] as const

export type FarmItem = (typeof FARM_ITEMS)[number]

export const FARM_SPRITES: Record<FarmItem, string> = {
  chicken: 'chicken',
  cow: 'cow',
  sheep: 'sheep',
  carrot: 'carrot',
  corn: 'corn',
  tomato: 'tomato',
  sunflower: 'sunflower',
  eggplant: 'eggplant',
  cabbage: 'cabbage',
  potato: 'potato',
}

export const ITEM_NAMES: Record<FarmItem, string> = {
  chicken: 'gallinas',
  cow: 'vacas',
  sheep: 'ovejas',
  carrot: 'zanahorias',
  corn: 'mazorcas',
  tomato: 'tomates',
  sunflower: 'girasoles',
  eggplant: 'berenjenas',
  cabbage: 'coles',
  potato: 'patatas',
}
