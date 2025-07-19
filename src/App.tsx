import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import appLogo from "/favicon.svg";
import PWABadge from "./PWABadge.tsx";
import "./App.css";
import { NotificationButton } from "./components/NotificationButton.tsx";
import ApiStatus from "./components/ApiStatus.tsx";
import { OnlineStatusIndicator } from "./components/OnlineStatusIndicator.tsx";
import { CameraCapture } from "./components/CameraCapture.tsx";
import { useOnlineStatus } from "./hooks/useOnlineStatus.ts";
import { addToQueue, getQueue, clearQueue } from "./services/queueService.ts";
import { mockApiRequest } from "./services/mockApiService.ts";

function App() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queuedItems, setQueuedItems] = useState<any[]>([]);
  const [todo, setTodo] = useState<{ title: string } | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);

  const isOnline = useOnlineStatus();

  const updateQueuedItemsDisplay = async () => {
    const queue = await getQueue();
    setQueuedItems(queue);
  };

  useEffect(() => {
    updateQueuedItemsDisplay();
  }, []);

  useEffect(() => {
    async function processQueue() {
      const queue = await getQueue();
      if (queue.length > 0) {
        console.log("Processing queue...");
        for (const action of queue) {
          try {
            await mockApiRequest(action.body);
          } catch (error) {
            console.error("Failed to process queued action:", error);
          }
        }
        await clearQueue();
        console.log("Queue processed and cleared.");
        updateQueuedItemsDisplay();
      }
    }

    if (isOnline) {
      processQueue();
    }
  }, [isOnline]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue) return;

    const action = {
      url: "/api/data",
      method: "POST",
      body: { message: inputValue },
    };

    if (isOnline) {
      try {
        await mockApiRequest(action.body);
        console.log("Data sent directly.");
      } catch (error) {
        console.error("API request failed, adding to queue:", error);
        await addToQueue(action);
        updateQueuedItemsDisplay();
      }
    } else {
      console.log("Offline, adding to queue.");
      await addToQueue(action);
      updateQueuedItemsDisplay();
    }

    setInputValue("");
  };

  const fetchTodo = async () => {
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setTodo(data);
    } catch (error) {
      console.error("Failed to fetch todo:", error);
    }
  };

  const handlePhotoCapture = (photoDataUrl: string) => {
    setCapturedPhotos((prev) => [...prev, photoDataUrl]);
    console.log("Photo captured and stored!");
  };

  return (
    <>
      <div>
        <a href='https://vite.dev' target='_blank'>
          <img src={appLogo} className='logo' alt='react-pwa-starter-app logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>react-pwa-starter-app</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
      <PWABadge />
      <NotificationButton />
      <ApiStatus />
      <OnlineStatusIndicator />

      {/* Camera Capture Section */}
      <div className='card'>
        <CameraCapture onPhotoCapture={handlePhotoCapture} />

        {capturedPhotos.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>📸 Photo Gallery ({capturedPhotos.length} photos)</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              {capturedPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Captured ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setCapturedPhotos([])}
              style={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Clear Gallery
            </button>
          </div>
        )}
      </div>

      <div className='card'>
        <h2>Offline Queue Example</h2>
        <form onSubmit={handleSubmit}>
          <input type='text' value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder='Enter data' />
          <button type='submit'>Submit</button>
        </form>
        <h3>Queued Items: {queuedItems.length}</h3>
        <ul>
          {queuedItems.map((item) => (
            <li key={item.timestamp}>{JSON.stringify(item.body)}</li>
          ))}
        </ul>
      </div>

      <div className='card'>
        <h2>API Caching Example</h2>
        <button onClick={fetchTodo}>Fetch Todo</button>
        {todo && (
          <div>
            <h3>Fetched Todo Title:</h3>
            <p>{todo.title}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
