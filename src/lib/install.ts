import { computed, reactive } from 'vue'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
const ios =
  /iphone|ipad|ipod/i.test(ua) ||
  (/macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1)

const standalone =
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true)

export const install = reactive({
  promptEvent: null as InstallPromptEvent | null,
  installed: standalone,
  help: false,
  ios,
})

/** The button stays available until the app is actually installed. */
export const showInstall = computed(() => !install.installed)

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    install.promptEvent = event as InstallPromptEvent
  })

  window.addEventListener('appinstalled', () => {
    install.installed = true
    install.promptEvent = null
    install.help = false
  })
}

/** Uses the native prompt when the browser offers it; otherwise explains how. */
export async function installApp() {
  const event = install.promptEvent
  if (!event) {
    install.help = true
    return
  }

  install.promptEvent = null
  try {
    await event.prompt()
    const choice = await event.userChoice
    if (choice.outcome === 'accepted') install.installed = true
  } catch {
    install.help = true
  }
}
