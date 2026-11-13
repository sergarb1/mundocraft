import { reactive } from 'vue'

export type CheerKind = 'praise' | 'encourage' | 'cheer'

/** Frases para cuando acierta. Cortas, alegres y sin comparaciones. */
export const PRAISE = [
  '¡Genial!',
  '¡Muy bien!',
  '¡Lo lograste!',
  '¡Increíble!',
  '¡Bravo!',
  '¡Qué bien lo has hecho!',
  '¡Eres un artista!',
  '¡Cada vez lo haces mejor!',
  '¡Lo has clavado!',
  '¡Qué cabeza tan lista!',
  '¡Sigue así!',
  '¡Estás en racha!',
  '¡Qué campeón!',
  '¡Me encanta cómo trabajas!',
  '¡Lo hiciste tú solo!',
  '¡Vas a lo grande!',
  '¡Otro acierto!',
  '¡Qué rápido aprendes!',
  '¡Ese es tu superpoder!',
  '¡Choca esos cinco!',
  '¡Perfecto!',
  '¡Te ha salido genial!',
  '¡Sigue construyendo!',
  '¡Una estrella para ti!',
  '¡Qué buen trabajo!',
  '¡Lo conseguiste!',
  '¡Paso a paso, muy bien!',
  '¡Qué paciencia tienes!',
  '¡Así se hace!',
  '¡Eres un sol!',
  '¡Qué bien piensas!',
  '¡A por la siguiente!',
  '¡Vas volando!',
  '¡Qué gran idea!',
  '¡Tú puedes con todo!',
  '¡Me haces muy feliz!',
  '¡Qué máquina!',
  '¡Otra vez genial!',
  '¡Qué bien te sale!',
  '¡Sigue brillando!',
]

/** Frases para cuando falla: ánimo, nunca castigo. */
export const ENCOURAGE = [
  'Casi lo tienes',
  'Prueba otra vez, tú puedes',
  'Los errores nos ayudan a aprender',
  'Respira y vuelve a intentarlo',
  'No pasa nada, inténtalo de nuevo',
  'Un intento más',
  'Piensa despacito',
  'Estás muy cerca',
  'Cada intento cuenta',
  'Tú puedes',
  'Vamos, otra vez',
  'Mira bien y prueba',
  'No tengas prisa',
  'Equivocarse es parte de aprender',
  'Lo estás haciendo bien, sigue',
  'Confía en ti',
  'Un poquito más',
  'Prueba con calma',
  'Yo creo en ti',
  '¡Vamos a por ello!',
  'Casi, casi',
  'Inténtalo a tu manera',
]

/** Frases para el mapa y los momentos de espera. */
export const CHEER = [
  'Hoy vas a aprender un montón',
  'Cada bloque cuenta',
  'Tú marcas tu ritmo',
  'Aquí se aprende jugando',
  'Elige y disfruta',
  '¡A construir ideas!',
  'Tu mente es un tesoro',
  'Vamos a pasarlo bien',
  'Paso a paso se llega lejos',
  'Hoy es un buen día para aprender',
  '¡Que empiece la aventura!',
  'Cada intento te hace más listo',
  'Disfruta y prueba',
  'Lo importante es jugar',
  '¡Vamos a por otra!',
  'Tu curiosidad es tu superpoder',
  'Aprender es divertido',
  '¡A descubrir!',
  'Hazlo a tu manera',
  '¡Tú decides!',
  'Un bloque, una idea',
  '¡Sigue tu instinto!',
  'Confía en tu cabeza',
  '¡Adelante, campeón!',
]

const pools: Record<CheerKind, string[]> = {
  praise: PRAISE,
  encourage: ENCOURAGE,
  cheer: CHEER,
}

const lastIndex: Record<CheerKind, number> = { praise: -1, encourage: -1, cheer: -1 }

/** Devuelve una frase aleatoria sin repetir la anterior del mismo tipo. */
export function phrase(kind: CheerKind = 'cheer'): string {
  const pool = pools[kind]
  let i = Math.floor(Math.random() * pool.length)
  if (pool.length > 1 && i === lastIndex[kind]) i = (i + 1) % pool.length
  lastIndex[kind] = i
  return pool[i]
}

/** Frase visible en la barra de ánimo; `n` fuerza la animación al cambiar. */
export const motivation = reactive({ text: phrase('cheer'), n: 0 })

export function motivate(kind: CheerKind = 'cheer'): string {
  motivation.text = phrase(kind)
  motivation.n += 1
  return motivation.text
}
