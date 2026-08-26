import { useRef, type ChangeEvent, type ReactNode } from 'react'
import { useStore } from '../../store/useStore'
import { Toggle } from '../ui/Toggle'
import { requestNotificationPermission } from '../../lib/notifications'
import { offerDownload } from '../../lib/download'

const STORAGE_KEY = 'zeitmanagement-store'

export function SettingsView() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleNotifications = async (v: boolean) => {
    if (v) {
      const perm = await requestNotificationPermission()
      updateSettings({ notificationsEnabled: perm === 'granted' })
    } else {
      updateSettings({ notificationsEnabled: false })
    }
  }

  const exportData = () => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    offerDownload(`focusflow-backup-${new Date().toISOString().slice(0, 10)}.json`, raw)
  }

  const importData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        JSON.parse(String(reader.result))
        localStorage.setItem(STORAGE_KEY, String(reader.result))
        window.location.reload()
      } catch {
        alert('Diese Datei ist keine gültige FocusFlow-Sicherung.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const resetAll = () => {
    if (!confirm('Wirklich alle Daten (Sessions, XP, Projekte, Prüfungen) unwiderruflich löschen?')) return
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-xl font-extrabold">⚙️ Einstellungen</h1>

      <Section title="Timer">
        <Toggle
          label="Pausen automatisch starten"
          description="Nach einer Fokus-Session direkt in die Pause wechseln."
          checked={settings.autoStartBreaks}
          onChange={(v) => updateSettings({ autoStartBreaks: v })}
        />
        <Toggle
          label="Fokus automatisch nach Pause starten"
          checked={settings.autoStartFocus}
          onChange={(v) => updateSettings({ autoStartFocus: v })}
        />
      </Section>

      <Section title="Benachrichtigungen">
        <Toggle
          label="Browser-Benachrichtigungen"
          description="Erinnert dich, wenn eine Session oder Pause vorbei ist."
          checked={settings.notificationsEnabled}
          onChange={toggleNotifications}
        />
      </Section>

      <Section title="Focus Mode">
        <Toggle
          label="Vollbild beim Start vorschlagen"
          checked={settings.focusModeFullscreen}
          onChange={(v) => updateSettings({ focusModeFullscreen: v })}
        />
        <Toggle
          label="Benachrichtigungen im Fokus-Modus stumm"
          checked={settings.focusModeMuteNotifications}
          onChange={(v) => updateSettings({ focusModeMuteNotifications: v })}
        />
        <Toggle
          label="Ablenkungs-Erinnerung anzeigen"
          checked={settings.focusModeBlockReminder}
          onChange={(v) => updateSettings({ focusModeBlockReminder: v })}
        />
      </Section>

      <Section title="Intelligenz">
        <Toggle
          label="Adaptive Vorschläge"
          description="Regelbasierte Empfehlungen zu Session-Länge basierend auf deinem Verhalten – läuft komplett lokal auf deinem Gerät."
          checked={settings.adaptiveSuggestionsEnabled}
          onChange={(v) => updateSettings({ adaptiveSuggestionsEnabled: v })}
        />
      </Section>

      <Section title="Daten">
        <p className="text-xs text-slate-500 mb-3">
          Alle Daten bleiben lokal auf diesem Gerät (localStorage) – es gibt keine Cloud-Synchronisierung. Exportiere
          regelmäßig ein Backup, besonders bevor du den Browser-Speicher leerst.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={exportData}>⬇️ Daten exportieren</button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>⬆️ Daten importieren</button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importData} />
          <button className="btn-ghost text-rose-400" onClick={resetAll}>Alle Daten löschen</button>
        </div>
      </Section>

      <Section title="App installieren">
        <p className="text-sm text-slate-400 leading-relaxed">
          <strong className="text-slate-200">iPad (Safari):</strong> Teilen-Symbol → „Zum Home-Bildschirm“ – FocusFlow
          läuft danach wie eine native App, auch offline.
          <br />
          <strong className="text-slate-200">Computer (Chrome/Edge):</strong> Symbol „App installieren“ in der
          Adressleiste, oder Menü → „FocusFlow installieren“.
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-sm font-semibold text-slate-300 mb-1">{title}</div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  )
}
