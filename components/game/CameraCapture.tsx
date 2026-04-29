/**
 * 摄像头拍照组件
 */
'use client';

import { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (photoBase64: string) => void;
  onCancel: () => void;
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 镜像翻转
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <h2 className="text-white text-2xl font-bold mb-6">🤳 AI 合照时间</h2>

      {error ? (
        <div className="text-red-400 text-center">
          <p>{error}</p>
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-2 bg-white/20 rounded-xl text-white hover:bg-white/30"
          >
            返回
          </button>
        </div>
      ) : capturedImage ? (
        <div className="flex flex-col items-center">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full max-w-md rounded-2xl mb-4 mirror"
          />
          <div className="flex gap-4">
            <button
              onClick={retake}
              className="px-6 py-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
            >
              重新拍摄
            </button>
            <button
              onClick={confirmPhoto}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-bold hover:from-blue-600 hover:to-purple-600"
            >
              使用这张 ✨
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-lg rounded-2xl mirror"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="mt-6 flex gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white/20 rounded-xl text-white hover:bg-white/30"
            >
              跳过
            </button>
            <button
              onClick={takePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-blue-400 hover:scale-110 transition-transform"
            />
          </div>
          <p className="text-blue-200 text-sm mt-4">点击圆形按钮拍照</p>
        </>
      )}
    </div>
  );
}
