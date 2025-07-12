import { useState, useEffect } from "react";
import { checkNotificationPermission, subscribeToNotifications, testServerNotification } from "../services/notificationService";

export const NotificationButton = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        console.log("Checking notification support...");
        const supported = "Notification" in window && "serviceWorker" in navigator;
        console.log("Notifications supported:", supported);
        setIsSupported(supported);

        if (supported) {
          const permission = await checkNotificationPermission();
          console.log("Current permission status:", permission);
          setIsSubscribed(permission);
        }
      } catch (err) {
        console.error("Error checking notification support:", err);
        setError("Failed to check notification support");
      }
    };
    checkSupport();
  }, []);

  const handleSubscribe = async () => {
    try {
      console.log("Requesting notification permission...");
      const hasPermission = await checkNotificationPermission();
      console.log("Permission granted:", hasPermission);

      if (hasPermission) {
        const subscription = await subscribeToNotifications();
        console.log("Subscription:", JSON.stringify(subscription));
        setIsSubscribed(true);
        setError(null);
      } else {
        setError("Permission denied");
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError("Failed to subscribe to notifications");
    }
  };

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={handleSubscribe}
        disabled={isSubscribed}
        style={{
          padding: "10px 20px",
          backgroundColor: isSubscribed ? "#cccccc" : "#4CAF50",
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
          <button onClick={() => testServerNotification({ title: "Test Notification", body: "This is a test from the server!" })}>
            Send Test Notification
          </button>
          <button onClick={() => testServerNotification({ title: "Like Notification", body: "Someone liked your post!" })}>
            Send Like Notification
          </button>
          <button onClick={() => testServerNotification({ title: "Custom Notification", body: "Here is some custom content." })}>
            Send Custom Notification
          </button>
        </div>
      )}
    </div>
  );
};
