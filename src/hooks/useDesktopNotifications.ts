export type NotificationPermissionState = "default" | "granted" | "denied";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermissionState {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission as NotificationPermissionState;
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isNotificationSupported()) return "denied";
  try {
    const perm = await Notification.requestPermission();
    return perm as NotificationPermissionState;
  } catch {
    return "denied";
  }
}

export function showDesktopNotification(opts: { title: string; body?: string; iconUrl?: string; onClick?: () => void }) {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  const notification = new Notification(opts.title, {
    body: opts.body,
    icon: opts.iconUrl,
    tag: "pflegeflix-message",
  });

  if (opts.onClick) {
    notification.onclick = (ev) => {
      ev.preventDefault();
      opts.onClick?.();
      notification.close();
    };
  }
  return true;
}