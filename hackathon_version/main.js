// VoiceLink AAC - Hackathon Version with ElevenLabs Integration
// Advanced AAC Application with Live Conversation Mode and Custom Voice Support

class VoiceLinkAAC {
    constructor() {
        this.currentMessage = [];
        this.currentCategory = 'core';
        this.currentEmotion = null;
        this.conversationContext = {
            location: 'home',
            timeOfDay: this.getTimeOfDay(),
            recentTopics: [],
            userPreferences: this.loadUserPreferences()
        };
        this.llmContext = {
            lastMessage: '',
            conversationHistory: [],
            userPatterns: new Map()
        };
        this.symbols = this.initializeSymbols();
        this.isSpeaking = false;
        this.accessibilityMode = {
            highContrast: false,
            largeText: false,
            reducedMotion: false
        };
        
        // Voice Settings
        this.voiceSettings = {
            selectedVoice: 'system',
            speechRate: 1.0,
            voicePitch: 1.0,
            systemVoice: null,
            elevenLabsVoice: null,
            customVoice: null
        };
        
        // Live Conversation Mode
        this.liveMode = {
            isActive: false,
            isRecording: false,
            currentScenario: null,
            conversationHistory: [],
            recognition: null,
            transcript: ''
        };
        
        // App Settings
        this.appSettings = {
            gridSize: 'medium',
            showSymbolLabels: true,
            audioFeedback: true,
            conversationHistory: false,
            usageAnalytics: true,
            autoSave: true,
            smartPredictions: true,
            learningMode: true,
            touchTargetSize: 'medium'
        };
        
        this.scenarios = this.initializeScenarios();
        
        this.init();
    }

    init() {
        this.loadSymbols();
        this.setupEventListeners();
        this.initializeSpeechSynthesis();
        this.loadUserData();
        this.updateContextIndicator();
        this.startLLMMonitoring();
        this.initializeElevenLabs();
        this.loadSettings();
        
        console.log('VoiceLink AAC Hackathon Version initialized successfully');
        console.log('ElevenLabs Integration: Ready');
    }

    // ElevenLabs Integration
    async initializeElevenLabs() {
        // Initialize ElevenLabs API connection
        this.elevenLabs = {
            apiKey: null, // Will be set when user provides it
            voices: [],
            currentVoice: null,
            isReady: false
        };
        
        // Load available ElevenLabs voices
        await this.loadElevenLabsVoices();
    }

    async loadElevenLabsVoices() {
        // Load API key from localStorage if available
        const savedApiKey = localStorage.getItem('elevenlabs_api_key');
        if (savedApiKey) {
            this.elevenLabs.apiKey = savedApiKey;
        }

        if (!this.elevenLabs.apiKey) {
            console.log('No ElevenLabs API key configured');
            return;
        }

        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                method: 'GET',
                headers: {
                    'xi-api-key': this.elevenLabs.apiKey
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.elevenLabs.voices = data.voices.map(voice => ({
                    id: voice.voice_id,
                    name: voice.name,
                    description: voice.labels?.description || 'ElevenLabs voice',
                    category: voice.category
                }));

                // Select first voice by default
                if (this.elevenLabs.voices.length > 0) {
                    this.elevenLabs.currentVoice = this.elevenLabs.voices[0];
                    this.elevenLabs.isReady = true;
                }

                console.log(`Loaded ${this.elevenLabs.voices.length} ElevenLabs voices`);
            } else {
                console.error('Failed to load ElevenLabs voices:', response.status);
            }
        } catch (error) {
            console.log('ElevenLabs voices not available:', error);
        }
    }

    async synthesizeWithElevenLabs(text) {
        if (!this.elevenLabs.apiKey || !this.elevenLabs.currentVoice) {
            console.log('ElevenLabs not configured, falling back to system voice');
            return false;
        }

        try {
            console.log('Synthesizing with ElevenLabs:', text);

            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.elevenLabs.currentVoice.id}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenLabs.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            // Apply voice settings
            audio.playbackRate = this.voiceSettings.speechRate || 1.0;

            await audio.play();

            // Clean up
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };

            return true;
        } catch (error) {
            console.error('ElevenLabs synthesis failed:', error);
            this.showNotification('ElevenLabs synthesis failed, using system voice');
            return false;
        }
    }

    // Symbol Management
    initializeSymbols() {
        return {
            core: [
                { id: 'i', label: 'I', image: '👤', type: 'pronoun' },
                { id: 'want', label: 'want', image: '🎯', type: 'verb' },
                { id: 'need', label: 'need', image: '✋', type: 'verb' },
                { id: 'like', label: 'like', image: '❤️', type: 'verb' },
                { id: 'help', label: 'help', image: '🤝', type: 'verb' },
                { id: 'go', label: 'go', image: '🚶', type: 'verb' },
                { id: 'stop', label: 'stop', image: '⛔', type: 'verb' },
                { id: 'yes', label: 'yes', image: '✅', type: 'response' },
                { id: 'no', label: 'no', image: '❌', type: 'response' },
                { id: 'more', label: 'more', image: '➕', type: 'modifier' },
                { id: 'done', label: 'done', image: '✔️', type: 'response' },
                { id: 'please', label: 'please', image: '🙏', type: 'courtesy' },
                { id: 'thank_you', label: 'thank you', image: '🙏', type: 'courtesy' },
                { id: 'sorry', label: 'sorry', image: '😔', type: 'courtesy' },
                { id: 'hello', label: 'hello', image: '👋', type: 'greeting' },
                { id: 'goodbye', label: 'goodbye', image: '👋', type: 'greeting' },
                { id: 'good', label: 'good', image: '👍', type: 'descriptor' },
                { id: 'bad', label: 'bad', image: '👎', type: 'descriptor' },
                { id: 'big', label: 'big', image: '📏', type: 'descriptor' },
                { id: 'small', label: 'small', image: '🔍', type: 'descriptor' },
                { id: 'hot', label: 'hot', image: '🔥', type: 'descriptor' },
                { id: 'cold', label: 'cold', image: '🧊', type: 'descriptor' },
                { id: 'happy', label: 'happy', image: '😊', type: 'emotion' }
            ],
            people: [
                { id: 'mom', label: 'mom', image: '👩', type: 'person' },
                { id: 'dad', label: 'dad', image: '👨', type: 'person' },
                { id: 'teacher', label: 'teacher', image: '👩‍🏫', type: 'person' },
                { id: 'friend', label: 'friend', image: '👫', type: 'person' },
                { id: 'doctor', label: 'doctor', image: '👨‍⚕️', type: 'person' },
                { id: 'nurse', label: 'nurse', image: '👩‍⚕️', type: 'person' },
                { id: 'therapist', label: 'therapist', image: '🧑‍⚕️', type: 'person' },
                { id: 'sibling', label: 'sibling', image: '👧', type: 'person' },
                { id: 'grandparent', label: 'grandparent', image: '👴', type: 'person' },
                { id: 'baby', label: 'baby', image: '👶', type: 'person' },
                { id: 'pet', label: 'pet', image: '🐕', type: 'person' },
                { id: 'cat', label: 'cat', image: '🐱', type: 'person' }
            ],
            actions: [
                { id: 'eat', label: 'eat', image: '🍽️', type: 'action' },
                { id: 'drink', label: 'drink', image: '🥤', type: 'action' },
                { id: 'play', label: 'play', image: '🎮', type: 'action' },
                { id: 'sleep', label: 'sleep', image: '😴', type: 'action' },
                { id: 'walk', label: 'walk', image: '🚶', type: 'action' },
                { id: 'run', label: 'run', image: '🏃', type: 'action' },
                { id: 'jump', label: 'jump', image: '🦘', type: 'action' },
                { id: 'sit', label: 'sit', image: '🪑', type: 'action' },
                { id: 'stand', label: 'stand', image: '🧍', type: 'action' },
                { id: 'read', label: 'read', image: '📖', type: 'action' },
                { id: 'write', label: 'write', image: '✍️', type: 'action' },
                { id: 'draw', label: 'draw', image: '🎨', type: 'action' },
                { id: 'listen', label: 'listen', image: '👂', type: 'action' },
                { id: 'watch', label: 'watch', image: '👀', type: 'action' },
                { id: 'talk', label: 'talk', image: '💬', type: 'action' },
                { id: 'sing', label: 'sing', image: '🎤', type: 'action' },
                { id: 'dance', label: 'dance', image: '💃', type: 'action' },
                { id: 'swim', label: 'swim', image: '🏊', type: 'action' },
                { id: 'cook', label: 'cook', image: '👨‍🍳', type: 'action' },
                { id: 'clean', label: 'clean', image: '🧹', type: 'action' },
                { id: 'work', label: 'work', image: '💼', type: 'action' },
                { id: 'study', label: 'study', image: '📚', type: 'action' },
                { id: 'rest', label: 'rest', image: '🛋️', type: 'action' },
                { id: 'exercise', label: 'exercise', image: '🏋️', type: 'action' }
            ],
            objects: [
                { id: 'book', label: 'book', image: '📚', type: 'object' },
                { id: 'toy', label: 'toy', image: '🧸', type: 'object' },
                { id: 'ball', label: 'ball', image: '⚽', type: 'object' },
                { id: 'car', label: 'car', image: '🚗', type: 'object' },
                { id: 'bus', label: 'bus', image: '🚌', type: 'object' },
                { id: 'bike', label: 'bike', image: '🚲', type: 'object' },
                { id: 'computer', label: 'computer', image: '💻', type: 'object' },
                { id: 'phone', label: 'phone', image: '📱', type: 'object' },
                { id: 'tv', label: 'tv', image: '📺', type: 'object' },
                { id: 'music', label: 'music', image: '🎵', type: 'object' },
                { id: 'game', label: 'game', image: '🎮', type: 'object' },
                { id: 'puzzle', label: 'puzzle', image: '🧩', type: 'object' },
                { id: 'pencil', label: 'pencil', image: '✏️', type: 'object' },
                { id: 'paper', label: 'paper', image: '📄', type: 'object' },
                { id: 'bag', label: 'bag', image: '👜', type: 'object' },
                { id: 'shoes', label: 'shoes', image: '👟', type: 'object' },
                { id: 'clothes', label: 'clothes', image: '👕', type: 'object' },
                { id: 'hat', label: 'hat', image: '👒', type: 'object' },
                { id: 'glasses', label: 'glasses', image: '👓', type: 'object' },
                { id: 'watch', label: 'watch', image: '⌚', type: 'object' },
                { id: 'money', label: 'money', image: '💰', type: 'object' },
                { id: 'key', label: 'key', image: '🔑', type: 'object' },
                { id: 'door', label: 'door', image: '🚪', type: 'object' },
                { id: 'window', label: 'window', image: '🪟', type: 'object' }
            ],
            places: [
                { id: 'home', label: 'home', image: '🏠', type: 'place' },
                { id: 'school', label: 'school', image: '🏫', type: 'place' },
                { id: 'hospital', label: 'hospital', image: '🏥', type: 'place' },
                { id: 'store', label: 'store', image: '🏪', type: 'place' },
                { id: 'park', label: 'park', image: '🌳', type: 'place' },
                { id: 'restaurant', label: 'restaurant', image: '🍽️', type: 'place' },
                { id: 'library', label: 'library', image: '📚', type: 'place' },
                { id: 'gym', label: 'gym', image: '🏋️', type: 'place' },
                { id: 'pool', label: 'pool', image: '🏊', type: 'place' },
                { id: 'beach', label: 'beach', image: '🏖️', type: 'place' },
                { id: 'mountain', label: 'mountain', image: '⛰️', type: 'place' },
                { id: 'zoo', label: 'zoo', image: '🦁', type: 'place' },
                { id: 'museum', label: 'museum', image: '🏛️', type: 'place' },
                { id: 'cinema', label: 'cinema', image: '🎬', type: 'place' },
                { id: 'theater', label: 'theater', image: '🎭', type: 'place' },
                { id: 'church', label: 'church', image: '⛪', type: 'place' },
                { id: 'mosque', label: 'mosque', image: '🕌', type: 'place' },
                { id: 'temple', label: 'temple', image: '🛕', type: 'place' },
                { id: 'office', label: 'office', image: '🏢', type: 'place' },
                { id: 'factory', label: 'factory', image: '🏭', type: 'place' },
                { id: 'farm', label: 'farm', image: '🚜', type: 'place' },
                { id: 'station', label: 'station', image: '🚉', type: 'place' },
                { id: 'airport', label: 'airport', image: '✈️', type: 'place' },
                { id: 'hotel', label: 'hotel', image: '🏨', type: 'place' }
            ],
            descriptors: [
                { id: 'red', label: 'red', image: '🔴', type: 'color' },
                { id: 'blue', label: 'blue', image: '🔵', type: 'color' },
                { id: 'green', label: 'green', image: '🟢', type: 'color' },
                { id: 'yellow', label: 'yellow', image: '🟡', type: 'color' },
                { id: 'orange', label: 'orange', image: '🟠', type: 'color' },
                { id: 'purple', label: 'purple', image: '🟣', type: 'color' },
                { id: 'black', label: 'black', image: '⚫', type: 'color' },
                { id: 'white', label: 'white', image: '⚪', type: 'color' },
                { id: 'brown', label: 'brown', image: '🟤', type: 'color' },
                { id: 'pink', label: 'pink', image: '🩷', type: 'color' },
                { id: 'gray', label: 'gray', image: '🔘', type: 'color' },
                { id: 'one', label: 'one', image: '1️⃣', type: 'number' },
                { id: 'two', label: 'two', image: '2️⃣', type: 'number' },
                { id: 'three', label: 'three', image: '3️⃣', type: 'number' },
                { id: 'four', label: 'four', image: '4️⃣', type: 'number' },
                { id: 'five', label: 'five', image: '5️⃣', type: 'number' },
                { id: 'many', label: 'many', image: '🔢', type: 'quantity' },
                { id: 'all', label: 'all', image: '🔠', type: 'quantity' },
                { id: 'none', label: 'none', image: '0️⃣', type: 'quantity' },
                { id: 'some', label: 'some', image: '🔣', type: 'quantity' },
                { id: 'fast', label: 'fast', image: '💨', type: 'speed' },
                { id: 'slow', label: 'slow', image: '🐌', type: 'speed' },
                { id: 'loud', label: 'loud', image: '📢', type: 'volume' },
                { id: 'quiet', label: 'quiet', image: '🤫', type: 'volume' }
            ]
        };
    }

    initializeScenarios() {
        return {
            order_food: {
                name: 'Order Food',
                icon: '🍽️',
                context: 'restaurant',
                suggestions: ['I want', 'Can I have', 'No thanks', 'Yes please']
            },
            medical: {
                name: 'Medical',
                icon: '🏥',
                context: 'hospital',
                suggestions: ['I feel', 'Pain in', 'Help please', 'Call doctor']
            },
            shopping: {
                name: 'Shopping',
                icon: '🛒',
                context: 'store',
                suggestions: ['How much', 'I need', 'Where is', 'Thank you']
            },
            social: {
                name: 'Social',
                icon: '👋',
                context: 'social',
                suggestions: ['Hello', 'How are you', 'Goodbye', 'See you later']
            },
            school: {
                name: 'School',
                icon: '🏫',
                context: 'school',
                suggestions: ['I understand', 'Can you repeat', 'I need help', 'Question']
            },
            emergency: {
                name: 'Emergency',
                icon: '🚨',
                context: 'emergency',
                suggestions: ['Help me', 'Call 911', 'Emergency', 'I need assistance']
            }
        };
    }

    loadSymbols() {
        const symbolGrid = document.getElementById('symbolGrid');
        if (!symbolGrid) return;

        symbolGrid.innerHTML = '';
        const currentSymbols = this.symbols[this.currentCategory] || [];

        currentSymbols.forEach(symbol => {
            const symbolBtn = document.createElement('button');
            symbolBtn.className = 'symbol-btn';
            symbolBtn.innerHTML = `
                <div class="symbol-image">${symbol.image}</div>
                ${this.appSettings.showSymbolLabels ? `<div class="symbol-label">${symbol.label}</div>` : ''}
            `;
            symbolBtn.onclick = () => this.addSymbolToMessage(symbol);
            symbolGrid.appendChild(symbolBtn);
        });
    }

    addSymbolToMessage(symbol) {
        this.currentMessage.push(symbol);
        this.updateMessageDisplay();
        if (this.appSettings.audioFeedback) {
            // Play a click sound
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQQ0NVarz7rpnHQc2muDy');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                if (category) {
                    this.currentCategory = category;
                    this.loadSymbols();
                    // Update active state
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });
    }

    initializeSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            // Wait for voices to load
            speechSynthesis.onvoiceschanged = () => {
                this.availableVoices = speechSynthesis.getVoices();
            };
            this.availableVoices = speechSynthesis.getVoices();
        }
    }

    loadUserData() {
        // Load user preferences from localStorage
        const savedData = localStorage.getItem('voicelinkUserData');
        if (savedData) {
            try {
                const userData = JSON.parse(savedData);
                if (userData.conversationContext) {
                    this.conversationContext = {...this.conversationContext, ...userData.conversationContext};
                }
                if (userData.voiceSettings) {
                    this.voiceSettings = {...this.voiceSettings, ...userData.voiceSettings};
                }
            } catch (e) {
                console.error('Error loading user data:', e);
            }
        }
    }

    updateContextIndicator() {
        const indicator = document.querySelector('.context-indicator');
        if (indicator) {
            const location = this.conversationContext.location || 'home';
            const icon = location === 'home' ? '🏠' : location === 'school' ? '🏫' : '📍';
            indicator.innerHTML = `${icon} At ${location.charAt(0).toUpperCase() + location.slice(1)}`;
        }
    }

    startLLMMonitoring() {
        // Monitor conversation patterns for AI suggestions
        setInterval(() => {
            if (this.llmContext.conversationHistory.length > 0) {
                // Simple pattern detection
                console.log('Monitoring conversation patterns...');
            }
        }, 30000); // Check every 30 seconds
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    loadUserPreferences() {
        const saved = localStorage.getItem('userPreferences');
        return saved ? JSON.parse(saved) : {};
    }

    addToConversationHistory(text) {
        this.llmContext.conversationHistory.push({
            text,
            timestamp: new Date().toISOString()
        });
        // Keep only last 50 messages
        if (this.llmContext.conversationHistory.length > 50) {
            this.llmContext.conversationHistory.shift();
        }
    }

    // Settings Management
    loadSettings() {
        const savedSettings = localStorage.getItem('voicelink_settings');
        if (savedSettings) {
            this.appSettings = { ...this.appSettings, ...JSON.parse(savedSettings) };
        }
        
        const savedVoiceSettings = localStorage.getItem('voicelink_voice_settings');
        if (savedVoiceSettings) {
            this.voiceSettings = { ...this.voiceSettings, ...JSON.parse(savedVoiceSettings) };
        }
        
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('voicelink_settings', JSON.stringify(this.appSettings));
        localStorage.setItem('voicelink_voice_settings', JSON.stringify(this.voiceSettings));
    }

    applySettings() {
        // Apply accessibility settings
        if (this.appSettings.showSymbolLabels) {
            document.body.classList.add('show-labels');
        } else {
            document.body.classList.remove('show-labels');
        }
        
        // Apply grid size
        this.updateGridSize(this.appSettings.gridSize);
        
        // Apply touch target size
        this.updateTouchTargetSize(this.appSettings.touchTargetSize);
        
        // Update settings panel toggles
        this.updateSettingsPanel();
    }

    updateSettingsPanel() {
        // Update toggle switches based on current settings
        const toggles = {
            'highContrastToggle': this.accessibilityMode.highContrast,
            'largeTextToggle': this.accessibilityMode.largeText,
            'reducedMotionToggle': this.accessibilityMode.reducedMotion,
            'symbolLabelsToggle': this.appSettings.showSymbolLabels,
            'audioFeedbackToggle': this.appSettings.audioFeedback,
            'conversationHistoryToggle': this.appSettings.conversationHistory,
            'usageAnalyticsToggle': this.appSettings.usageAnalytics,
            'autoSaveToggle': this.appSettings.autoSave,
            'smartPredictionsToggle': this.appSettings.smartPredictions,
            'learningModeToggle': this.appSettings.learningMode
        };
        
        Object.keys(toggles).forEach(toggleId => {
            const toggle = document.getElementById(toggleId);
            if (toggle) {
                if (toggles[toggleId]) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            }
        });
        
        // Update sliders
        const speechRateSlider = document.getElementById('speechRate');
        const speechRateValue = document.getElementById('speechRateValue');
        if (speechRateSlider && speechRateValue) {
            speechRateSlider.value = this.voiceSettings.speechRate;
            speechRateValue.textContent = this.voiceSettings.speechRate + 'x';
        }
        
        const voicePitchSlider = document.getElementById('voicePitch');
        const voicePitchValue = document.getElementById('voicePitchValue');
        if (voicePitchSlider && voicePitchValue) {
            voicePitchSlider.value = this.voiceSettings.voicePitch;
            voicePitchValue.textContent = this.voiceSettings.voicePitch + 'x';
        }
        
        // Update dropdowns
        const gridSizeSelect = document.getElementById('gridSize');
        if (gridSizeSelect) {
            gridSizeSelect.value = this.appSettings.gridSize;
        }
        
        const touchTargetSizeSelect = document.getElementById('touchTargetSize');
        if (touchTargetSizeSelect) {
            touchTargetSizeSelect.value = this.appSettings.touchTargetSize;
        }

        // Update ElevenLabs API key field
        const apiKeyInput = document.getElementById('elevenLabsApiKey');
        if (apiKeyInput && this.elevenLabs.apiKey) {
            apiKeyInput.value = this.elevenLabs.apiKey;
        }
    }

    // Voice Management
    async selectVoice(voiceType) {
        this.voiceSettings.selectedVoice = voiceType;
        
        // Update voice selection UI
        document.querySelectorAll('.voice-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-voice="${voiceType}"]`).classList.add('selected');
        
        if (voiceType === 'elevenlabs') {
            await this.setupElevenLabsVoice();
        } else if (voiceType === 'custom') {
            await this.setupCustomVoice();
        } else {
            this.setupSystemVoice();
        }
        
        this.saveSettings();
        this.showNotification(`Voice changed to ${voiceType}`);
    }

    async setupElevenLabsVoice() {
        // In real implementation, this would prompt for API key
        const apiKey = prompt('Enter your ElevenLabs API key:');
        if (apiKey) {
            this.elevenLabs.apiKey = apiKey;
            this.elevenLabs.isReady = true;
            
            // Select default ElevenLabs voice
            this.elevenLabs.currentVoice = this.elevenLabs.voices[0];
            this.showNotification('ElevenLabs voice activated');
        } else {
            // Fall back to system voice
            this.selectVoice('system');
        }
    }

    setupSystemVoice() {
        if ('speechSynthesis' in window) {
            const voices = speechSynthesis.getVoices();
            // Select a child-friendly voice if available
            this.voiceSettings.systemVoice = voices.find(voice => 
                voice.name.includes('child') || 
                voice.name.includes('kid') ||
                voice.gender === 'female'
            ) || voices[0];
        }
    }

    async setupCustomVoice() {
        // In real implementation, this would handle custom voice upload
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Process custom voice file
                this.voiceSettings.customVoice = URL.createObjectURL(file);
                this.showNotification('Custom voice uploaded successfully');
            }
        };
        fileInput.click();
    }

    updateSpeechRate(rate) {
        this.voiceSettings.speechRate = parseFloat(rate);
        document.getElementById('speechRateValue').textContent = rate + 'x';
        this.saveSettings();
    }

    updateVoicePitch(pitch) {
        this.voiceSettings.voicePitch = parseFloat(pitch);
        document.getElementById('voicePitchValue').textContent = pitch + 'x';
        this.saveSettings();
    }

    // Accessibility Settings
    toggleHighContrast() {
        this.accessibilityMode.highContrast = !this.accessibilityMode.highContrast;
        document.body.classList.toggle('high-contrast', this.accessibilityMode.highContrast);
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('High contrast mode ' + (this.accessibilityMode.highContrast ? 'enabled' : 'disabled'));
    }

    toggleLargeText() {
        this.accessibilityMode.largeText = !this.accessibilityMode.largeText;
        document.body.classList.toggle('large-text', this.accessibilityMode.largeText);
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Large text mode ' + (this.accessibilityMode.largeText ? 'enabled' : 'disabled'));
    }

    toggleReducedMotion() {
        this.accessibilityMode.reducedMotion = !this.accessibilityMode.reducedMotion;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Reduced motion mode ' + (this.accessibilityMode.reducedMotion ? 'enabled' : 'disabled'));
    }

    toggleSymbolLabels() {
        this.appSettings.showSymbolLabels = !this.appSettings.showSymbolLabels;
        this.updateSettingsPanel();
        this.saveSettings();
        this.loadSymbols(); // Reload symbols to apply label visibility
        this.showNotification('Symbol labels ' + (this.appSettings.showSymbolLabels ? 'enabled' : 'disabled'));
    }

    toggleAudioFeedback() {
        this.appSettings.audioFeedback = !this.appSettings.audioFeedback;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Audio feedback ' + (this.appSettings.audioFeedback ? 'enabled' : 'disabled'));
    }

    updateGridSize(size) {
        this.appSettings.gridSize = size;
        this.saveSettings();
        
        const symbolGrid = document.getElementById('symbolGrid');
        switch (size) {
            case 'small':
                symbolGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                break;
            case 'medium':
                symbolGrid.style.gridTemplateColumns = 'repeat(6, 1fr)';
                break;
            case 'large':
                symbolGrid.style.gridTemplateColumns = 'repeat(8, 1fr)';
                break;
        }
    }

    updateTouchTargetSize(size) {
        this.appSettings.touchTargetSize = size;
        this.saveSettings();
        
        const symbolBtns = document.querySelectorAll('.symbol-btn');
        symbolBtns.forEach(btn => {
            switch (size) {
                case 'small':
                    btn.style.minHeight = '44px';
                    break;
                case 'medium':
                    btn.style.minHeight = '60px';
                    break;
                case 'large':
                    btn.style.minHeight = '80px';
                    break;
                case 'extra-large':
                    btn.style.minHeight = '100px';
                    break;
            }
        });
    }

    toggleConversationHistory() {
        this.appSettings.conversationHistory = !this.appSettings.conversationHistory;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Conversation history ' + (this.appSettings.conversationHistory ? 'enabled' : 'disabled'));
    }

    toggleUsageAnalytics() {
        this.appSettings.usageAnalytics = !this.appSettings.usageAnalytics;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Usage analytics ' + (this.appSettings.usageAnalytics ? 'enabled' : 'disabled'));
    }

    toggleAutoSave() {
        this.appSettings.autoSave = !this.appSettings.autoSave;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Auto-save ' + (this.appSettings.autoSave ? 'enabled' : 'disabled'));
    }

    toggleSmartPredictions() {
        this.appSettings.smartPredictions = !this.appSettings.smartPredictions;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Smart predictions ' + (this.appSettings.smartPredictions ? 'enabled' : 'disabled'));
    }

    toggleLearningMode() {
        this.appSettings.learningMode = !this.appSettings.learningMode;
        this.updateSettingsPanel();
        this.saveSettings();
        this.showNotification('Learning mode ' + (this.appSettings.learningMode ? 'enabled' : 'disabled'));
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            location.reload();
        }
    }

    // Enhanced Speech Synthesis with Voice Selection
    async speakMessage() {
        if (this.currentMessage.length === 0) return;
        
        const messageText = this.currentMessage.map(symbol => symbol.label).join(' ');
        
        if (this.voiceSettings.selectedVoice === 'elevenlabs' && this.elevenLabs.isReady) {
            const success = await this.synthesizeWithElevenLabs(messageText);
            if (success) return;
        }
        
        // Fall back to system speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(messageText);
            utterance.rate = this.voiceSettings.speechRate;
            utterance.pitch = this.voiceSettings.voicePitch;
            utterance.volume = 0.8;
            
            if (this.voiceSettings.systemVoice) {
                utterance.voice = this.voiceSettings.systemVoice;
            }
            
            this.isSpeaking = true;
            this.updateMessageDisplay();
            
            utterance.onend = () => {
                this.isSpeaking = false;
                this.updateMessageDisplay();
            };
            
            speechSynthesis.speak(utterance);
            
            if (this.appSettings.audioFeedback) {
                this.playFeedbackSound();
            }
            
            // Add to conversation history
            this.addToConversationHistory(messageText);
        } else {
            this.showNotification('Speech synthesis not supported in this browser');
        }
    }

    // Settings Panel Management
    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsBtn = document.getElementById('settingsBtn');
        
        if (settingsPanel.classList.contains('open')) {
            settingsPanel.classList.remove('open');
            settingsBtn.classList.remove('active');
        } else {
            settingsPanel.classList.add('open');
            settingsBtn.classList.add('active');
        }
    }

    // Live Conversation Mode (from previous implementation)
    // [Previous live conversation mode code remains the same]
    toggleLiveMode() {
        const liveModePanel = document.getElementById('liveModePanel');
        const liveModeBtn = document.getElementById('liveModeBtn');
        
        if (!this.liveMode.isActive) {
            this.activateLiveMode();
            liveModePanel.style.display = 'flex';
            liveModeBtn.classList.add('active');
            liveModeBtn.style.color = '#E07A5F';
        } else {
            this.deactivateLiveMode();
            liveModePanel.style.display = 'none';
            liveModeBtn.classList.remove('active');
            liveModeBtn.style.color = '';
        }
    }

    activateLiveMode() {
        this.liveMode.isActive = true;
        this.setupSpeechRecognition();
        this.showScenarioSelector();
    }

    deactivateLiveMode() {
        this.liveMode.isActive = false;
        if (this.liveMode.recognition) {
            this.liveMode.recognition.stop();
        }
    }

    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Speech recognition not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.liveMode.recognition = new SpeechRecognition();
        this.liveMode.recognition.continuous = true;
        this.liveMode.recognition.interimResults = true;

        this.liveMode.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            this.liveMode.transcript = transcript;
            document.getElementById('liveTranscript').textContent = transcript;
        };
    }

    showScenarioSelector() {
        // Show scenario selection UI
        console.log('Showing scenario selector');
    }

    toggleRecording() {
        if (!this.liveMode.isRecording) {
            this.liveMode.recognition?.start();
            this.liveMode.isRecording = true;
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) {
                recordBtn.textContent = '⏹️ Stop Recording';
                recordBtn.classList.add('active');
            }
        } else {
            this.liveMode.recognition?.stop();
            this.liveMode.isRecording = false;
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) {
                recordBtn.textContent = '🎤 Start Recording';
                recordBtn.classList.remove('active');
            }
        }
    }

    selectScenario() {
        // Simple scenario selection - in production this would show a modal
        const scenarios = ['order_food', 'medical', 'shopping', 'social', 'school', 'emergency'];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        this.liveMode.currentScenario = scenario;
        this.showNotification(`Scenario: ${scenario.replace('_', ' ').toUpperCase()}`);
    }

    closeLiveMode() {
        this.deactivateLiveMode();
        const liveModePanel = document.getElementById('liveModePanel');
        const liveModeBtn = document.getElementById('liveModeBtn');
        if (liveModePanel) liveModePanel.style.display = 'none';
        if (liveModeBtn) {
            liveModeBtn.classList.remove('active');
            liveModeBtn.style.color = '';
        }
    }

    toggleAccessibility() {
        // Simple toggle for accessibility panel
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('open');
            // Scroll to accessibility section
            const accessibilitySection = settingsPanel.querySelector('h4');
            if (accessibilitySection) {
                accessibilitySection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    clearMessage() {
        this.currentMessage = [];
        this.updateMessageDisplay();
        this.showNotification('Message cleared');
    }

    savePhrase() {
        if (this.currentMessage.length === 0) {
            this.showNotification('No message to save');
            return;
        }

        const messageText = this.currentMessage.map(symbol => symbol.label).join(' ');
        const savedPhrases = JSON.parse(localStorage.getItem('savedPhrases') || '[]');
        savedPhrases.push({
            text: messageText,
            symbols: this.currentMessage,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('savedPhrases', JSON.stringify(savedPhrases));
        this.showNotification('Phrase saved!');
    }

    selectEmotion(emotion) {
        this.currentEmotion = emotion;
        // Update visual feedback
        document.querySelectorAll('.emotion-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const emotionBtn = document.querySelector(`[data-emotion="${emotion}"]`);
        if (emotionBtn) {
            emotionBtn.classList.add('active');
        }
        this.showNotification(`Emotion: ${emotion}`);
    }

    updateMessageDisplay() {
        const messageDisplay = document.getElementById('currentMessage');
        if (messageDisplay) {
            messageDisplay.textContent = this.currentMessage.map(s => s.label).join(' ');
        }
    }

    // Utility Functions
    shareMessage() {
        if (this.currentMessage.length === 0) {
            this.showNotification('No message to share');
            return;
        }
        
        const messageText = this.currentMessage.map(symbol => symbol.label).join(' ');
        
        if (navigator.share) {
            navigator.share({
                title: 'VoiceLink AAC Message',
                text: messageText
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(messageText).then(() => {
                this.showNotification('Message copied to clipboard');
            });
        }
    }

    // [Rest of the utility functions remain unchanged]
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-primary);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // [Rest of the methods remain unchanged from previous implementation]
    // ... [Previous methods] ...
}

// Global Functions for HTML onclick handlers
let aacApp;

function initApp() {
    aacApp = new VoiceLinkAAC();
}

// [All previous global functions remain unchanged]
// ... [Previous global functions] ...

// New settings-related global functions
function toggleSettings() {
    aacApp.toggleSettings();
}

function selectVoice(voiceType) {
    aacApp.selectVoice(voiceType);
}

function updateSpeechRate(rate) {
    aacApp.updateSpeechRate(rate);
}

function updateVoicePitch(pitch) {
    aacApp.updateVoicePitch(pitch);
}

function toggleHighContrast() {
    aacApp.toggleHighContrast();
}

function toggleLargeText() {
    aacApp.toggleLargeText();
}

function toggleReducedMotion() {
    aacApp.toggleReducedMotion();
}

function toggleSymbolLabels() {
    aacApp.toggleSymbolLabels();
}

function toggleAudioFeedback() {
    aacApp.toggleAudioFeedback();
}

function updateGridSize(size) {
    aacApp.updateGridSize(size);
}

function updateTouchTargetSize(size) {
    aacApp.updateTouchTargetSize(size);
}

function toggleConversationHistory() {
    aacApp.toggleConversationHistory();
}

function toggleUsageAnalytics() {
    aacApp.toggleUsageAnalytics();
}

function toggleAutoSave() {
    aacApp.toggleAutoSave();
}

function toggleSmartPredictions() {
    aacApp.toggleSmartPredictions();
}

function toggleLearningMode() {
    aacApp.toggleLearningMode();
}

function clearAllData() {
    aacApp.clearAllData();
}

function shareMessage() {
    aacApp.shareMessage();
}

function toggleLiveMode() {
    aacApp.toggleLiveMode();
}

function toggleAccessibility() {
    aacApp.toggleAccessibility();
}

function toggleRecording() {
    aacApp.toggleRecording();
}

function selectScenario() {
    aacApp.selectScenario();
}

function closeLiveMode() {
    aacApp.closeLiveMode();
}

function clearMessage() {
    aacApp.clearMessage();
}

function speakMessage() {
    aacApp.speakMessage();
}

function savePhrase() {
    aacApp.savePhrase();
}

function selectEmotion(emotion) {
    aacApp.selectEmotion(emotion);
}

async function saveElevenLabsApiKey(apiKey) {
    if (!apiKey || apiKey.trim() === '') {
        localStorage.removeItem('elevenlabs_api_key');
        aacApp.elevenLabs.apiKey = null;
        aacApp.elevenLabs.isReady = false;
        aacApp.showNotification('ElevenLabs API key removed');
        return;
    }

    localStorage.setItem('elevenlabs_api_key', apiKey.trim());
    aacApp.elevenLabs.apiKey = apiKey.trim();
    aacApp.showNotification('API key saved! Loading voices...');

    // Reload voices with new API key
    await aacApp.loadElevenLabsVoices();

    if (aacApp.elevenLabs.isReady) {
        aacApp.showNotification(`✓ Loaded ${aacApp.elevenLabs.voices.length} ElevenLabs voices`);
    } else {
        aacApp.showNotification('⚠ Could not load voices. Check API key.');
    }
}

async function testElevenLabsConnection() {
    const apiKey = document.getElementById('elevenLabsApiKey').value;

    if (!apiKey) {
        aacApp.showNotification('Please enter an API key first');
        return;
    }

    aacApp.showNotification('Testing connection...');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey
            }
        });

        if (response.ok) {
            const data = await response.json();
            aacApp.showNotification(`✓ Connected! Found ${data.voices.length} voices`);
        } else if (response.status === 401) {
            aacApp.showNotification('✗ Invalid API key');
        } else {
            aacApp.showNotification(`✗ Error: ${response.status}`);
        }
    } catch (error) {
        aacApp.showNotification('✗ Connection failed');
        console.error('Connection test failed:', error);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Service Worker Registration for offline capability
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceLinkAAC;
}