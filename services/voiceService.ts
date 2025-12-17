export const speak = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9; // Slightly slower for seniors
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};

// Type definition for Web Speech API
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export const startListening = (onResult: (text: string) => void, onEnd: () => void) => {
  const { webkitSpeechRecognition, SpeechRecognition } = window as unknown as IWindow;
  const SpeechRecognitionAPI = SpeechRecognition || webkitSpeechRecognition;

  if (!SpeechRecognitionAPI) {
    alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
    onEnd();
    return null;
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.lang = 'ko-KR';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = () => {
    onEnd();
  };

  recognition.onend = () => {
    onEnd();
  };

  recognition.start();
  return recognition;
};