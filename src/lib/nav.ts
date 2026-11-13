import { reactive } from 'vue'

export type SectionId = 'math' | 'letters' | 'syllables' | 'build'

export const SECTIONS: SectionId[] = ['math', 'letters', 'syllables', 'build']

export const nav = reactive({
  section: null as SectionId | null,
  game: null as string | null,
  mission: false,
})

function parse() {
  const raw = location.hash.replace(/^#\/?/, '')
  const [section, game] = raw.split('/')
  nav.mission = section === 'misiones'
  if (nav.mission) {
    nav.section = null
    nav.game = null
  } else if ((SECTIONS as string[]).includes(section)) {
    nav.section = section as SectionId
    nav.game = game ? decodeURIComponent(game) : null
  } else {
    nav.section = null
    nav.game = null
  }
}

window.addEventListener('hashchange', parse)
parse()

export function openSection(section: SectionId) {
  if (section === 'build') {
    location.hash = '/build'
  } else {
    location.hash = `/${section}`
  }
}

export function openGame(section: SectionId, game: string) {
  location.hash = `/${section}/${game}`
}

export function openMission() {
  location.hash = '/misiones'
}

export function goMap() {
  if (location.hash === '' || location.hash === '#/') {
    nav.section = null
    nav.game = null
    nav.mission = false
  } else {
    location.hash = '/'
  }
}
