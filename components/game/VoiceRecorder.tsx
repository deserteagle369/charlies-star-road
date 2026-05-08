/**
 * 语音朗读组件
 * 使用浏览器原生 Web Speech API 进行语音识别
 * 带实时音量波形显示
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceRecorderProps {
  expectedAnswer: string;
  onSuccess: () => void;
  onFail: (transcript: string) => void;
  disabled?: boolean;
}

// 创建 SpeechRecognition 实例（工厂函数，每次录音新建一个）
function createRecognition(
  onResult: (text: string, isFinal: boolean) => void,
  onEnd: () => void,
  onError: (error: string) => void
): SpeechRecognition | null {
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  if (!SpeechRecognitionAPI) return null;

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      onResult(event.results[i][0].transcript, event.results[i].isFinal);
    }
  };
  recognition.onend = onEnd;
  recognition.onerror = (event) => onError(event.error);

  return recognition;
}

export default function VoiceRecorder({
  expectedAnswer,
  onSuccess,
  onFail,
  disabled = false,
}: VoiceRecorderProps) {
  type Status = 'idle' | 'recording' | 'processing' | 'success' | 'fail';
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  // 录音状态用 ref 记录（不受闭包影响），避免 onEnd 里读到过期的 status
  const isRecordingRef = useRef(false);
  const finalTextRef = useRef('');
  const [interimText, setInterimText] = useState('');  // 实时识别文字（state 用于 UI 更新）

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 启动麦克风音量分析
  const startAudioAnalysis = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const draw = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const bufLen = analyserRef.current.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        analyserRef.current.getByteFrequencyData(data);
        ctx.fillStyle = 'rgb(30,30,60)';
        ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
        let x = 0;
        const barW = (canvasRef.current!.width / bufLen) * 2.5;
        for (let i = 0; i < bufLen; i++) {
          const h = (data[i] / 255) * canvasRef.current!.height;
          ctx.fillStyle = `hsl(${280 + (data[i] / 255) * 40},80%,${50 + (data[i] / 255) * 30}%)`;
          ctx.fillRect(x, canvasRef.current!.height - h, barW - 1, h);
          x += barW;
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    } catch {
      // 麦克风获取失败，静默继续
    }
  }, []);

  // 停止麦克风
  const stopAudioAnalysis = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // 开始录音
  const startRecording = useCallback(() => {
    if (disabled) return;

    finalTextRef.current = '';
    setInterimText('');
    setError('');
    setStatus('recording');
    isRecordingRef.current = true;
    startAudioAnalysis();

    const onResult = (text: string, isFinal: boolean) => {
      if (isFinal) {
        finalTextRef.current += text;
        setInterimText('');  // 清空临时文字
      } else {
        setInterimText(text);  // 实时更新识别中的文字
      }
    };

    // 核心：isRecordingRef 检查，绕开 stale closure 问题
    const onEnd = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopAudioAnalysis();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
      if (!isRecordingRef.current) return; // ← 关键守卫
      isRecordingRef.current = false;

      setStatus('processing');
      const spoken = finalTextRef.current.toLowerCase().trim();
      const answer = expectedAnswer.toLowerCase().trim();

      if (matchAnswer(spoken, answer)) {
        setStatus('success');
        setTimeout(() => onSuccess(), 1200);
      } else {
        setStatus('fail');
        setTimeout(() => onFail(spoken), 1200);
      }
    };

    const onError = (err: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      stopAudioAnalysis();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
      }
      if (!isRecordingRef.current) return;
      isRecordingRef.current = false;

      if (err === 'no-speech') {
        setStatus('fail');
        setError('未检测到语音，请重试');
        setTimeout(() => onFail(''), 1000);
      } else if (err === 'not-allowed') {
        setError('请允许麦克风权限');
        setStatus('fail');
      } else if (err !== 'aborted') {
        setError(`语音识别错误: ${err}`);
        setStatus('fail');
      } else {
        setStatus('idle');
      }
    };

    const recognition = createRecognition(onResult, onEnd, onError);
    if (!recognition) {
      setError('当前浏览器不支持语音识别，请使用 Chrome/Edge');
      setStatus('fail');
      stopAudioAnalysis();
      isRecordingRef.current = false;
      return;
    }
    recognitionRef.current = recognition;
    try {
      recognition.start();
      // 10 秒超时自动停止
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isRecordingRef.current) {
          try { recognitionRef.current.stop(); } catch { /* 忽略 */ }
        }
      }, 10000);
    } catch {
      isRecordingRef.current = false;
      setStatus('idle');
      stopAudioAnalysis();
    }
  }, [disabled, expectedAnswer, onSuccess, onFail, startAudioAnalysis, stopAudioAnalysis]);

  // 手动停止录音
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* 可能已停止 */ }
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
    }
    stopAudioAnalysis();
    setStatus('idle');
  }, [stopAudioAnalysis]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopAudioAnalysis();
      try { recognitionRef.current?.abort(); } catch { /* 静默 */ }
    };
  }, [stopAudioAnalysis]);

  // 显示内容
  const showInterim = status === 'recording' && interimText;
  const showSuccess = status === 'success';
  const showFail = status === 'fail';
  const showIdle = status === 'idle';

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 音量波形 */}
      {status === 'recording' && (
        <canvas
          ref={canvasRef}
          width={280}
          height={60}
          className="w-full rounded-lg"
        />
      )}

      {/* 正在听 */}
      {status === 'recording' && (
        <div className="flex items-center gap-2 text-red-300">
          <span className="text-xl animate-pulse">🎙️</span>
          <span className="text-sm animate-pulse">正在听你朗读...</span>
        </div>
      )}

      {/* 实时识别文字 */}
      {showInterim && (
        <div className="max-w-xs text-center text-xs text-purple-200/80 bg-purple-900/30 rounded-lg px-3 py-1.5 truncate">
          {interimText}
        </div>
      )}

      {/* 识别中 */}
      {status === 'processing' && (
        <div className="flex items-center gap-2 text-yellow-300">
          <div className="w-4 h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">识别中...</span>
        </div>
      )}

      {/* 朗读正确 */}
      {showSuccess && (
        <div className="flex flex-col items-center gap-1 text-green-300">
          <span className="text-2xl">✅</span>
          <span className="text-sm">朗读正确！</span>
          {finalTextRef.current && (
            <span className="text-xs text-green-200/70">"你读的是: {finalTextRef.current}"</span>
          )}
        </div>
      )}

      {/* 朗读失败 */}
      {showFail && (
        <div className="flex flex-col items-center gap-1 text-red-300">
          <span className="text-2xl">❌</span>
          <span className="text-sm">{finalTextRef.current ? '再试一次' : '未检测到语音'}</span>
          {finalTextRef.current && (
            <span className="text-xs text-red-200/70">"你读的是: {finalTextRef.current}"</span>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && showIdle && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-red-300 text-xs">{error}</span>
        </div>
      )}

      {/* 按钮：idle */}
      {showIdle && (
        <button
          onClick={startRecording}
          disabled={disabled}
          className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 active:scale-95 ${
            disabled
              ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
          }`}
        >
          🎤 点击朗读答案
        </button>
      )}

      {/* 按钮：录音中 */}
      {status === 'recording' && (
        <button
          onClick={stopRecording}
          className="w-full py-3 rounded-xl bg-red-500/80 text-white font-bold text-lg hover:bg-red-500 transition-all duration-200 active:scale-95"
        >
          ⏹️ 停止录音
        </button>
      )}

      {/* 按钮：成功/失败后重试 */}
      {(showSuccess || showFail) && (
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-2 rounded-xl bg-white/20 text-white text-sm hover:bg-white/30 transition-colors"
        >
          再试一次
        </button>
      )}
    </div>
  );
}

function matchAnswer(spoken: string, answer: string): boolean {
  if (!spoken || !answer) return false;
  const s = spoken.replace(/\s+/g, '').toLowerCase();
  const a = answer.replace(/\s+/g, '').toLowerCase();
  return s === a || s.includes(a) || a.includes(s);
}
