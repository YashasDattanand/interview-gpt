export function useSpeechRecognition(
  onFinalText: (text: string) => void,
  onListeningChange: (listening: boolean) => void
) {
  let recognition: any = null;
  let silenceTimer: any = null;

  const start = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      onListeningChange(true);
    };

    recognition.onresult = (event: any) => {
      const lastResult = event.results[event.results.length - 1];
      const text = lastResult[0].transcript.trim();
      if (text) onFinalText(text);
      resetSilenceTimer();
    };

    recognition.onerror = () => stop();
    recognition.onend = () => onListeningChange(false);

    recognition.start();
    resetSilenceTimer();
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(() => {
      stop();
    }, 8000); // 🔥 8 seconds silence
  };

  const stop = () => {
    if (recognition) recognition.stop();
    clearTimeout(silenceTimer);
  };

  return { start, stop };
}
