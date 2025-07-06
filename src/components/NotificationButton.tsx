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
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  const handleSendNotification = async (type: "default" | "like" | "custom") => {
    try {
      await sendTestNotification(type);
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
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

      {isSubscribed && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => handleSendNotification("default")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send Default
          </button>
          <button
            onClick={() => handleSendNotification("like")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send Like
          </button>
          <button
            onClick={() => handleSendNotification("custom")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Send Custom
          </button>
        </div>
      )}
    </div>
  );
};
