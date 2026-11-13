import type { Component } from 'vue'
import type { SectionId } from '../lib/nav'
import MNumero from './math/MNumero.vue'
import MCantidad from './math/MCantidad.vue'
import MContar from './math/MContar.vue'
import MAdelante from './math/MAdelante.vue'
import MAtras from './math/MAtras.vue'
import MOrdenar from './math/MOrdenar.vue'
import MVecinos from './math/MVecinos.vue'
import MMSecuencia from './math/MMSecuencia.vue'
import MSumar from './math/MSumar.vue'
import MRestar from './math/MRestar.vue'
import MOperaciones from './math/MOperaciones.vue'
import MOpVisual from './math/MOpVisual.vue'
import LReconocer from './letters/LReconocer.vue'
import LParejas from './letters/LParejas.vue'
import LEnPalabra from './letters/LEnPalabra.vue'
import LTrazos from './letters/LTrazos.vue'
import LRepasar from './letters/LRepasar.vue'
import LCompletar from './letters/LCompletar.vue'
import LEscribir from './letters/LEscribir.vue'
import LSilabaTrazos from './letters/LSilabaTrazos.vue'
import SReconocer from './syllables/SReconocer.vue'
import SImagen from './syllables/SImagen.vue'
import SFalta from './syllables/SFalta.vue'
import SClasificar from './syllables/SClasificar.vue'
import SConstruir from './syllables/SConstruir.vue'
import SOrdenar from './syllables/SOrdenar.vue'
import SPalabraImagen from './syllables/SPalabraImagen.vue'
import BuildGame from './build/BuildGame.vue'

export type GameDef = {
  id: string
  section: SectionId
  name: string
  desc: string
  emoji: string
  tone: string
  component: Component
}

export const GAMES: GameDef[] = [
  // Matemáticas
  { id: 'm-numero', section: 'math', name: 'Los números', desc: 'Reconoce del 1 al 20', emoji: '🔢', tone: 'grass', component: MNumero },
  { id: 'm-cantidad', section: 'math', name: '¿Cuántos hay?', desc: 'Número y cantidad', emoji: '🧺', tone: 'leaf', component: MCantidad },
  { id: 'm-contar', section: 'math', name: 'Cuenta y elige', desc: 'Toca y cuenta objetos', emoji: '👆', tone: 'gold', component: MContar },
  { id: 'm-adelante', section: 'math', name: 'El puente', desc: 'Cuenta hacia delante', emoji: '🌉', tone: 'wood', component: MAdelante },
  { id: 'm-atras', section: 'math', name: 'Cuenta atrás', desc: 'Cuenta hacia atrás', emoji: '🚀', tone: 'sky', component: MAtras },
  { id: 'm-ordenar', section: 'math', name: 'En orden', desc: 'Ordena los números', emoji: '📏', tone: 'purple', component: MOrdenar },
  { id: 'm-vecinos', section: 'math', name: 'Antes y después', desc: 'El anterior y el posterior', emoji: '🔍', tone: 'rose', component: MVecinos },
  { id: 'm-secuencia', section: 'math', name: 'La serie', desc: 'Completa secuencias', emoji: '🧩', tone: 'gold', component: MMSecuencia },
  { id: 'm-sumar', section: 'math', name: 'Sumar', desc: 'Junta bloques y suma', emoji: '➕', tone: 'grass', component: MSumar },
  { id: 'm-restar', section: 'math', name: 'Quitar', desc: 'Resta quitando objetos', emoji: '➖', tone: 'rose', component: MRestar },
  { id: 'm-operaciones', section: 'math', name: 'Cuentas', desc: 'Operaciones sencillas', emoji: '🧮', tone: 'sky', component: MOperaciones },
  { id: 'm-opvisual', section: 'math', name: 'Cuenta y dibujo', desc: 'Cuenta con dibujos', emoji: '🖼️', tone: 'leaf', component: MOpVisual },

  // Letras y escritura
  { id: 'l-reconocer', section: 'letters', name: 'La letra', desc: 'Reconoce las minúsculas', emoji: '🔤', tone: 'wood', component: LReconocer },
  { id: 'l-parejas', section: 'letters', name: 'Parejas', desc: 'Mayúscula y minúscula', emoji: '🅰️', tone: 'gold', component: LParejas },
  { id: 'l-en-palabra', section: 'letters', name: 'La letra escondida', desc: 'Busca en la palabra', emoji: '🔎', tone: 'sky', component: LEnPalabra },
  { id: 'l-trazos', section: 'letters', name: 'Trazos', desc: 'Líneas, curvas y zigzag', emoji: '✏️', tone: 'paper', component: LTrazos },
  { id: 'l-repasar', section: 'letters', name: 'Repasa la letra', desc: 'Traza la letra con el dedo', emoji: '🖍️', tone: 'rose', component: LRepasar },
  { id: 'l-completar', section: 'letters', name: 'Falta un trazo', desc: 'Completa la letra', emoji: '🧩', tone: 'purple', component: LCompletar },
  { id: 'l-escribir', section: 'letters', name: 'Escribe', desc: 'Escribe sin ayuda', emoji: '✍️', tone: 'leaf', component: LEscribir },
  { id: 'l-silaba-trazos', section: 'letters', name: 'Sílabas con el dedo', desc: 'Traza sílabas', emoji: '💫', tone: 'gold', component: LSilabaTrazos },

  // Sílabas y palabras
  { id: 's-reconocer', section: 'syllables', name: 'La sílaba', desc: 'Reconoce sílabas', emoji: '🗣️', tone: 'sky', component: SReconocer },
  { id: 's-imagen', section: 'syllables', name: '¿Con qué empieza?', desc: 'Sílaba e imagen', emoji: '🖼️', tone: 'leaf', component: SImagen },
  { id: 's-falta', section: 'syllables', name: 'Falta una sílaba', desc: 'Completa la palabra', emoji: '🧩', tone: 'gold', component: SFalta },
  { id: 's-clasificar', section: 'syllables', name: 'Las cestas', desc: 'Clasifica por sílaba', emoji: '🧺', tone: 'wood', component: SClasificar },
  { id: 's-construir', section: 'syllables', name: 'Construye', desc: 'Junta sílabas', emoji: '🧱', tone: 'rose', component: SConstruir },
  { id: 's-ordenar', section: 'syllables', name: 'En orden', desc: 'Ordena las sílabas', emoji: '🔤', tone: 'purple', component: SOrdenar },
  { id: 's-palabra-imagen', section: 'syllables', name: 'Palabra y dibujo', desc: 'Empareja palabra e imagen', emoji: '🎴', tone: 'sky', component: SPalabraImagen },

  // Construcción libre
  { id: 'construir', section: 'build', name: 'Construcción libre', desc: 'Crea tu propio mundo', emoji: '🧱', tone: 'stone', component: BuildGame },
]

export function gamesOf(section: SectionId): GameDef[] {
  return GAMES.filter((game) => game.section === section)
}

export function sectionGameIds(section: SectionId): string[] {
  return gamesOf(section).map((game) => game.id)
}

export function gameById(id: string): GameDef | undefined {
  return GAMES.find((game) => game.id === id)
}
