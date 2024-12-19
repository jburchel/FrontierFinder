// Pronunciation utilities
class PronunciationService {
    constructor() {
        this.synth = window.speechSynthesis;
    }

    // Format pronunciation for display
    formatPronunciation(pronunciation) {
        return pronunciation ? `(${pronunciation})` : '';
    }

    // Create pronunciation element with play button
    createPronunciationElement(name, pronunciation) {
        const container = document.createElement('span');
        container.classList.add('pronunciation-container');

        // Add pronunciation text
        const pronunciationText = document.createElement('span');
        pronunciationText.classList.add('pronunciation');
        pronunciationText.textContent = this.formatPronunciation(pronunciation);
        container.appendChild(pronunciationText);

        // Add play button if pronunciation is available
        if (pronunciation) {
            const playButton = document.createElement('button');
            playButton.classList.add('play-button');
            playButton.innerHTML = '🔊'; // Speaker icon
            playButton.title = 'Play pronunciation';
            playButton.onclick = () => this.speak(name, pronunciation);
            container.appendChild(playButton);
        }

        return container;
    }

    // Speak the name using text-to-speech
    speak(name, pronunciation) {
        // Cancel any ongoing speech
        this.synth.cancel();

        // Create utterance with pronunciation guide
        const utterance = new SpeechSynthesisUtterance(pronunciation || name);
        utterance.rate = 0.8; // Slightly slower for better clarity
        utterance.pitch = 1;
        utterance.volume = 1;

        // Speak
        this.synth.speak(utterance);
    }
}

// Create global instance
const pronunciationService = new PronunciationService();
