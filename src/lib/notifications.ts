export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Notification.permission
}

export function sendNotification(title: string, body: string, silent = false) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, silent, icon: '/icons/icon-192.png' })
  } catch {
    /* some browsers throw if not from a service worker context on mobile; ignore */
  }
}
