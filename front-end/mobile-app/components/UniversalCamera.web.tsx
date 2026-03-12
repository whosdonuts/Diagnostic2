import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

export interface CameraHandle {
  capture: () => void;
}

interface UniversalCameraProps {
  onCapture: (uri: string) => void;
  isActive: boolean;
}

/**
 * Web camera implementation using the HTML5 MediaDevices API.
 * Renders a native <video> element for zero-dependency browser compatibility.
 */
export const UniversalCamera = forwardRef<CameraHandle, UniversalCameraProps>(
  function UniversalCamera({ onCapture, isActive }, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [status, setStatus] = useState<"pending" | "granted" | "denied">(
      "pending",
    );

    useImperativeHandle(
      ref,
      () => ({
        capture() {
          const video = videoRef.current;
          if (!video) return;

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.drawImage(video, 0, 0);
          onCapture(canvas.toDataURL("image/jpeg", 0.85));
        },
      }),
      [onCapture],
    );

    useEffect(() => {
      if (!isActive) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        return;
      }

      let cancelled = false;

      (async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
            audio: false,
          });

          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setStatus("granted");
        } catch {
          if (!cancelled) setStatus("denied");
        }
      })();

      return () => {
        cancelled = true;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
    }, [isActive]);

    if (status === "denied") {
      return (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#052E16",
            gap: 12,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#86EFAC"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16.5 7.5h.01M2 9V6.5C2 4.01 4.01 2 6.5 2H9m6 0h2.5C19.99 2 22 4.01 22 6.5V9m0 6v2.5c0 2.49-2.01 4.5-4.5 4.5H15m-6 0H6.5C4.01 22 2 19.99 2 17.5V15" />
            <circle cx="12" cy="13" r="3" />
          </svg>
          <p
            style={{
              color: "#DCFCE7",
              fontSize: 16,
              textAlign: "center",
              padding: "0 32px",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Camera access is required.
            <br />
            Please allow camera permissions in your browser settings.
          </p>
        </div>
      );
    }

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          backgroundColor: "#000",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    );
  },
);
