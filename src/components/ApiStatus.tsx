import { useState, useEffect } from "react";

const ApiStatus = () => {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/test`;
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setStatus(data.message || "Ready");
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setStatus("Offline or API not reachable");
      });
  }, []);

  return (
    <div>
      <h2>API Status</h2>
      <p>{status}</p>
    </div>
  );
};

export default ApiStatus;
