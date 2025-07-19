import React, { useRef, useState, useCallback, useEffect } from "react";

interface CameraCaptureProps {
  onPhotoCapture?: (photoDataUrl: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      setStream(mediaStream);
      setIsStreaming(true);
    } catch (err) {
      console.error("Camera access error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera permissions and try again.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotSupportedError") {
          setError("Camera not supported in this browser.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Unknown camera error occurred.");
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsStreaming(false);
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photoDataUrl);

    if (onPhotoCapture) {
      onPhotoCapture(photoDataUrl);
    }
  }, [isStreaming, onPhotoCapture]);

  const downloadPhoto = useCallback(() => {
    if (!capturedPhoto) return;

    const link = document.createElement("a");
    link.download = `photo-${new Date().toISOString()}.jpg`;
    link.href = capturedPhoto;
    link.click();
  }, [capturedPhoto]);

  const clearPhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>📷 Camera Capture</h2>

      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#ffe6e6",
            padding: "10px",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        {!isStreaming ? (
          <button
            onClick={startCamera}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Start Camera
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              onClick={capturePhoto}
              style={{
                backgroundColor: "#2196F3",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                minWidth: "140px",
              }}
            >
              📸 Capture Photo
            </button>
            <button
              onClick={stopCamera}
              style={{
                backgroundColor: "#f44336",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px",
                minWidth: "120px",
              }}
            >
              🛑 Stop Camera
            </button>
          </div>
        )}
      </div>

      {/* Video preview */}
      {isStreaming && (
        <div style={{ marginBottom: "20px" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              maxWidth: "500px",
              height: "auto",
              border: "2px solid #ddd",
              borderRadius: "8px",
            }}
          />
        </div>
      )}

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Captured photo display */}
      {capturedPhoto && (
        <div style={{ marginTop: "20px" }}>
          <h3>📸 Captured Photo:</h3>
          <img
            src={capturedPhoto}
            alt='Captured'
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              border: "2px solid #ddd",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />
          <div>
            <button
              onClick={downloadPhoto}
              style={{
                backgroundColor: "#FF9800",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              💾 Download
            </button>
            <button
              onClick={clearPhoto}
              style={{
                backgroundColor: "#9E9E9E",
                color: "white",
                padding: "8px 16px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      )}

      {/* Browser support info */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          borderRadius: "5px",
          fontSize: "14px",
        }}
      >
        <strong>💡 Desktop Testing:</strong>
        <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
          <li>Works with your webcam on Chrome, Firefox, Safari, Edge</li>
          <li>Browser will ask for camera permission</li>
          <li>Make sure your webcam is not being used by other apps</li>
          <li>Use HTTPS in production (localhost works for development)</li>
        </ul>
      </div>
    </div>
  );
};
