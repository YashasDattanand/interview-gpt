export function useSpeechRecognition(
  onFinalText: (text: string) => void,
  onListeningChange: (listening: boolean) => void
) {
  let recognition: any = null;
  let silenceTimer: any = null;
  let maxTimer: any = null;
  let manuallyStopped = false;
  let hasSpoken = false;

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  const start = () => {
    manuallyStopped = false;
    hasSpoken = false;

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      onListeningChange(true);
      maxTimer = setTimeout(stop, 120000); // 🔥 2 minutes max
    };

    recognition.onresult = (event: any) => {
      hasSpoken = true;
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript.trim();
      if (text) onFinalText(text);
      resetSilenceTimer();
    };

    recognition.onend = () => {
      if (!manuallyStopped) restart();
      else cleanup();
    };

    recognition.onerror = () => restart();

    recognition.start();
  };

  const resetSilenceTimer = () => {
    if (!hasSpoken) return; // ❌ no silence logic before first speech
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stop, 8000);
  };

  const restart = () => {
    stop(false);
    setTimeout(start, 300);
  };

  const stop = (manual = true) => {
    manuallyStopped = manual;
    recognition?.stop();
  };

  const cleanup = () => {
    clearTimeout(silenceTimer);
    clearTimeout(maxTimer);
    onListeningChange(false);
  };

  return { start, stop };
}
