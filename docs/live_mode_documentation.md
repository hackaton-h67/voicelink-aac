# VoiceLink AAC - Live Conversation Mode Documentation

## Overview

The Live Conversation Mode is an innovative feature that transforms VoiceLink AAC into a real-time communication assistant. By using the device's microphone, the application can listen to live conversations and provide contextual suggestions to help users respond appropriately in various social situations.

## Key Features

### 🎤 **Real-Time Speech Recognition**
- Continuous listening mode with Web Speech API
- Instant transcription of conversations
- Automatic detection of questions and context
- Support for multiple speakers and natural dialogue

### 🎯 **Scenario-Based Communication**
Six pre-configured scenarios optimized for common communication situations:

1. **Order Food** 🍽️ - Restaurant and food service interactions
2. **Medical Appointment** 🏥 - Healthcare and medical consultations  
3. **Shopping** 🛒 - Retail and customer service interactions
4. **Social Interaction** 👥 - Casual conversations and meeting people
5. **School** 🎓 - Educational and classroom communication
6. **Emergency** 🚨 - Urgent and emergency situations

### 🧠 **Intelligent Context Analysis**
- Question detection and appropriate response suggestions
- Follow-up question generation for natural conversation flow
- Scenario-specific vocabulary and phrase recommendations
- Emotional context awareness for appropriate responses

### 💬 **Dynamic Suggestion Engine**
- Real-time updates based on conversation flow
- Context-aware response options
- Integration with main AAC symbol grid
- One-tap response selection and speech output

## How It Works

### Step 1: Activate Live Mode
- Click the microphone icon in the header
- Choose your conversation scenario from the selector
- The interface switches to full-screen conversation mode

### Step 2: Start Listening
- Click "Start Listening" to begin recording
- The app continuously analyzes speech from conversation partners
- Transcripts appear in real-time in the conversation display

### Step 3: Receive Suggestions
- AI analyzes the conversation and provides relevant response options
- Suggestions appear based on questions asked or context detected
- Scenario-specific suggestions are prioritized

### Step 4: Respond
- Tap any suggestion to add it to your message
- Use the main symbol grid to build custom responses
- Tap "Speak" to vocalize your response
- Continue the conversation with ongoing suggestions

## Technical Implementation

### Speech Recognition
```javascript
// Web Speech API Integration
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
this.liveMode.recognition = new SpeechRecognition();
this.liveMode.recognition.continuous = true;
this.liveMode.recognition.interimResults = true;
this.liveMode.recognition.lang = 'en-US';
```

### Context Analysis
The system analyzes conversation context through:
- **Question Detection**: Identifies interrogative statements
- **Keyword Matching**: Scenario-specific vocabulary recognition  
- **Pattern Recognition**: Common conversation flow patterns
- **Sentiment Analysis**: Emotional tone interpretation

### Suggestion Generation
Suggestions are generated using a multi-layer approach:
1. **Direct Response** - Direct answers to questions
2. **Contextual Follow-up** - Appropriate next statements
3. **Scenario-Specific** - Situation-appropriate phrases
4. **General Purpose** - Universal communication options

## Scenario Details

### Order Food Scenario
**Context**: Restaurant, cafe, or food service environment
**Key Phrases**:
- "I would like to order"
- "Can I see the menu"
- "I have allergies"
- "How much does it cost"
- "I want to pay"

**Follow-up Detection**:
- Menu questions → Suggest viewing options
- Allergy inquiries → Suggest dietary restrictions
- Payment questions → Suggest payment methods

### Medical Appointment Scenario  
**Context**: Doctor's office, hospital, or healthcare facility
**Key Phrases**:
- "I am not feeling well"
- "I have pain here"
- "I take medication"
- "I have allergies"
- "I feel anxious"

**Follow-up Detection**:
- Symptom questions → Suggest detailed descriptions
- Medication inquiries → Suggest current prescriptions
- Pain assessment → Suggest pain level indicators

### Shopping Scenario
**Context**: Retail store, mall, or customer service
**Key Phrases**:
- "I am looking for"
- "How much does this cost"
- "I need help finding"
- "Can I try this on"
- "I want to return this"

**Follow-up Detection**:
- Product questions → Suggest specific items
- Price inquiries → Suggest budget considerations
- Size questions → Suggest size preferences

## Accessibility Features

### Visual Accessibility
- **High Contrast Mode**: Enhanced visibility for conversation text
- **Large Text Options**: Scalable font sizes for readability
- **Clear Visual Hierarchy**: Distinct styling for different message types

### Motor Accessibility  
- **Large Touch Targets**: Minimum 44px touch areas
- **Voice Control**: Speech-to-text for hands-free operation
- **Switch Navigation**: Compatible with assistive switches

### Cognitive Accessibility
- **Simplified Interface**: Reduced cognitive load during conversations
- **Clear Visual Feedback**: Obvious recording and processing states
- **Consistent Patterns**: Predictable interaction models

## Privacy and Security

### Data Handling
- **Local Processing**: Speech recognition happens on-device
- **No Data Storage**: Conversation transcripts are not permanently stored
- **User Control**: Easy start/stop recording controls
- **Visual Indicators**: Clear recording state notifications

### Consent and Ethics
- **Visual Recording Indicator**: Clear indication when microphone is active
- **User Initiation**: Recording only starts with explicit user action
- **Conversation Transparency**: All participants can see the app is listening

## Usage Examples

### Restaurant Scenario
```
Server: "What would you like to drink?"
App Suggests: ["Water please", "I want soda", "What do you have?", "No thank you"]
User selects: "Water please"
App speaks: "Water please"
Server: "And for your meal?"
App Suggests: ["I want the chicken", "What do you recommend?", "I need help deciding"]
```

### Medical Scenario
```
Doctor: "How are you feeling today?"
App Suggests: ["I am not feeling well", "I have pain", "I feel better", "I am worried"]
User selects: "I have pain"
App speaks: "I have pain"
Doctor: "Where does it hurt?"
App Suggests: ["Here in my chest", "In my stomach", "My head hurts", "My back"]
```

## Benefits and Impact

### Communication Independence
- Reduces reliance on caregivers for interpretation
- Enables direct participation in conversations
- Builds confidence in social interactions

### Conversation Quality
- Provides appropriate, context-aware responses
- Maintains natural conversation flow
- Reduces communication breakdowns

### Social Inclusion
- Facilitates participation in everyday interactions
- Supports various social contexts and environments
- Promotes independence and self-advocacy

## Future Enhancements

### Planned Features
- **Custom Scenario Creation**: User-defined conversation contexts
- **Multi-Language Support**: Speech recognition in multiple languages
- **Voice Banking Integration**: Use of personalized synthetic voices
- **Conversation History**: Optional saving of successful interactions

### Technical Improvements
- **Enhanced AI Models**: More sophisticated context analysis
- **Noise Reduction**: Better performance in noisy environments
- **Multi-Speaker Recognition**: Distinguishing between conversation participants
- **Offline Capability**: Full functionality without internet connection

## Conclusion

The Live Conversation Mode represents a significant advancement in AAC technology, bridging the gap between traditional symbol-based communication and real-time conversational assistance. By combining speech recognition, contextual AI, and scenario-specific support, VoiceLink AAC provides users with unprecedented independence in social communication.

This feature transforms the AAC experience from a one-way communication tool into a dynamic conversation partner, enabling users to participate more fully in the social interactions that are essential to human connection and quality of life.