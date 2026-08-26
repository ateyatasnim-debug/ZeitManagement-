# FocusFlow 🚀

Pomodoro-Timer mit Fokus-Statistik, Gamification, Projekten und Study Mode – als installierbare App (PWA) für Computer und iPad.

## Features

- **⏱️ Pomodoro-Timer** – 25/5, 50/10, 15/3 oder eigene Zeiten, mit Start/Pause/Skip und automatischen Pausen
- **📊 Fokus-Statistik** – Fokuszeit heute/Woche/Monat, Sessions, Ø-Länge, Erfolgsrate, beste Uhrzeit, Diagramme
- **🎯 Tagesziel** mit Fortschrittsbalken
- **🔔 Benachrichtigungen** (Browser-Notifications)
- **🎵 Soundscapes** – Regen, Café, White Noise, Wald, Lo-Fi (lokal generiert mit der Web Audio API, funktioniert offline)
- **🧠 Adaptive Vorschläge** – regelbasierte Empfehlung für bessere Session-Längen basierend auf deinem Verlauf
- **📈 Fokus-Score** pro Session (Abschluss, Pausen, Ablenkungen, Dauer)
- **🎮 Gamification** – XP, Level, Streaks, 14 Achievements
- **📱 Ablenkungs-Tracker** mit Wochenauswertung
- **🚫 Focus Mode** – Vollbild-Fokusansicht mit Benachrichtigungs-Stumm und Ablenkungs-Erinnerung
- **📚 Projekte & Unterprojekte** mit Zeit-Tracking pro Projekt
- **🧑‍🎓 Study Mode** – Prüfungen mit Lernfortschritt + regelbasierter Lernplan-Generator
- **🌱 Virtuelles Wachstum** – ein Baum wächst mit deiner täglichen Fokuszeit
- **💡 Tages-Insights** – dein produktivstes Zeitfenster, regelbasiert ermittelt
- **⚡ Energy Mode** – Energie vor der Session wählen, App zeigt historisch passende Session-Länge

Alle Daten bleiben lokal auf dem Gerät (`localStorage`) – keine Cloud, kein Server, kein Tracking. Export/Import als JSON-Backup ist in den Einstellungen möglich.

## Entwicklung

```bash
npm install
npm run dev       # Dev-Server
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```

## Als App installieren

- **iPad (Safari):** Teilen-Symbol → „Zum Home-Bildschirm“
- **Computer (Chrome/Edge):** Installations-Symbol in der Adressleiste oder Menü → „FocusFlow installieren“

Die App ist eine Progressive Web App (PWA) mit Offline-Support via Service Worker.

## Tech-Stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand (State, `localStorage`-persistiert) · Recharts · vite-plugin-pwa
