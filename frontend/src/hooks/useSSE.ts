import { useEffect, useRef, useState } from "react";

export interface Notification {
  message: string;
  timestamp: number;
}

export function useSSE(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const es = new EventSource("/auth/notifications", { withCredentials: true });
    esRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as Notification;
      setNotifications((prev) => [...prev, data]);
    };
    return () => es.close();
  }, [enabled]);

  return notifications;
}
