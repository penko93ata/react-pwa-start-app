import { useState, useEffect } from "react";
import { checkNotificationPermission, subscribeToNotifications, sendTestNotification } from "../services/notificationService";

export const NotificationButton = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = "Notification" in window && "serviceWorker" in navigator;
      setIsSupported(supported);
      if (supported) {
        const permission = await checkNotificationPermission();
        setIsSubscribed(permission);
      }
    };
    checkSupport();
  }, []);

  const handleSubscribe = async () => {
    try {
      const hasPermission = await checkNotificationPermission();
      if (hasPermission) {
        await subscribeToNotifications();
        setIsSubscribed(true);
        // Send a test notification
        await sendTestNotification();
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isSubscribed}
      style={{
        padding: "10px 20px",
        backgroundColor: isSubscribed ? "#ccc" : "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: isSubscribed ? "default" : "pointer",
      }}
    >
      {isSubscribed ? "Notifications Enabled" : "Enable Notifications"}
    </button>
  );
};
