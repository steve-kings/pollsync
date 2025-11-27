# 🤖 AI Features Documentation

PollSync now includes powerful AI features powered by Google's Gemini 2.5 Flash API. These features enhance election security, provide intelligent insights, and improve user experience.

## 🎯 Features Overview

### 1. AI Fraud Detection
Automatically detects suspicious voting patterns and potential fraud in elections.

**Capabilities:**
- Real-time fraud risk scoring (0-100)
- Detection of rapid voting sequences
- Identification of duplicate voter IDs
- IP-based suspicious activity detection
- AI-powered pattern analysis
- Actionable recommendations

**API Endpoints:**
```javascript
// Analyze entire election for fraud
GET /api/ai/fraud/analyze/:electionId

// Check individual vote for fraud
POST /api/ai/fraud/check-vote
Body: { voteData, electionId }
```

**Usage Example:**
```javascript
const analysis = await api.get(`/api/ai/fraud/analyze/${electionId}`);
console.log(analysis.riskLevel); // 'low', 'medium', 'high', 'critical'
console.log(analysis.riskScore); // 0-100
console.log(analysis.issues); // Array of detected issues
```

---

### 2. Smart Analytics Dashboard
AI-generated insights and predictions for elections.

**Capabilities:**
- Comprehensive election insights
- Winner predictions with confidence levels
- Voter engagement analysis
- Trend identification
- Executive summary reports
- Performance recommendations

**API Endpoints:**
```javascript
// Get AI insights for election
GET /api/ai/analytics/insights/:electionId

// Get predictions for ongoing election
GET /api/ai/analytics/predictions/:electionId

// Generate executive summary
GET /api/ai/analytics/executive-summary/:electionId
```

**Usage Example:**
```javascript
const insights = await api.get(`/api/ai/analytics/insights/${electionId}`);
console.log(insights.summary); // Brief overview
console.log(insights.keyInsights); // Array of insights
console.log(insights.predictions); // Winner prediction
```

---

### 3. AI Chatbot
24/7 intelligent support for voters and organizers.

**Capabilities:**
- Context-aware responses
- Platform-specific knowledge
- User and election context integration
- Quick help suggestions
- FAQ generation
- Intent analysis

**API Endpoints:**
```javascript
// Send message to chatbot
POST /api/ai/chatbot/message
Body: { message, context: { userId, electionId } }

// Get quick help suggestions
GET /api/ai/chatbot/quick-help/:userType

// Generate FAQ answer
POST /api/ai/chatbot/faq
Body: { question }
```

**Usage Example:**
```javascript
const response = await api.post('/api/ai/chatbot/message', {
    message: 'How do I create an election?',
    context: { userId: user._id }
});
console.log(response.message); // AI response
```

---

### 4. Automated Insights
Personalized insights and recommendations for users.

**Capabilities:**
- Dashboard insights
- Completion insights for finished elections
- Pricing recommendations
- Automated email content generation
- Usage pattern analysis
- Next steps suggestions

**API Endpoints:**
```javascript
// Get dashboard insights
GET /api/ai/insights/dashboard

// Get completion insights
GET /api/ai/insights/completion/:electionId

// Get pricing recommendations
GET /api/ai/insights/pricing

// Generate email content
POST /api/ai/insights/email
Body: { type, data }
```

**Usage Example:**
```javascript
const insights = await api.get('/api/ai/insights/dashboard');
console.log(insights.summary); // Overview of activity
console.log(insights.recommendations); // Personalized tips
console.log(insights.nextSteps); // Suggested actions
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install @google/generative-ai
```

### 2. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 3. Configure Environment
Add to your `server/.env` file:
```env
GEMINI_API_KEY=your_api_key_here
```

### 4. Restart Server
```bash
npm run dev
```

---

## 📦 React Components

### AIChatbot Component
Floating chatbot widget for all pages.

**Usage:**
```tsx
import AIChatbot from '@/components/AIChatbot';

export default function Layout({ children }) {
    return (
        <>
            {children}
            <AIChatbot />
        </>
    );
}
```

### AIInsightsPanel Component
Dashboard insights panel.

**Usage:**
```tsx
import AIInsightsPanel from '@/components/AIInsightsPanel';

export default function Dashboard() {
    return (
        <div>
            <AIInsightsPanel />
            {/* Other dashboard content */}
        </div>
    );
}
```

### FraudDetectionPanel Component
Fraud analysis for election details.

**Usage:**
```tsx
import FraudDetectionPanel from '@/components/FraudDetectionPanel';

export default function ElectionDetails({ electionId }) {
    return (
        <div>
            <FraudDetectionPanel electionId={electionId} />
            {/* Other election details */}
        </div>
    );
}
```

---

## 🔧 Configuration

### Gemini Model
Currently using: **Gemini 2.5 Flash** (gemini-2.0-flash-exp)
- Best balance of reasoning and speed
- Free tier available
- Fast response times
- High-quality outputs

### Rate Limits (Free Tier)
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

### Customization
Edit `server/config/geminiService.js` to:
- Change model
- Adjust generation parameters
- Modify prompts
- Add custom functions

---

## 🎨 UI Integration

### Add Chatbot to All Pages
Edit `client/app/layout.tsx`:
```tsx
import AIChatbot from '@/components/AIChatbot';

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
                <AIChatbot />
            </body>
        </html>
    );
}
```

### Add Insights to Dashboard
Edit `client/app/dashboard/page.tsx`:
```tsx
import AIInsightsPanel from '@/components/AIInsightsPanel';

// Add to your dashboard grid
<AIInsightsPanel />
```

### Add Fraud Detection to Election Details
Edit `client/app/dashboard/elections/[id]/page.tsx`:
```tsx
import FraudDetectionPanel from '@/components/FraudDetectionPanel';

// Add as a new tab or section
<FraudDetectionPanel electionId={id} />
```

---

## 📊 Performance Tips

1. **Cache Results**: Store AI responses to reduce API calls
2. **Batch Requests**: Combine multiple analyses when possible
3. **Async Loading**: Load AI features after main content
4. **Error Handling**: Always provide fallbacks
5. **Rate Limiting**: Implement client-side throttling

---

## 🔒 Security Considerations

1. **API Key Protection**: Never expose in client code
2. **Input Validation**: Sanitize all user inputs
3. **Rate Limiting**: Implement server-side limits
4. **Access Control**: Protect sensitive endpoints
5. **Data Privacy**: Don't send PII to AI unnecessarily

---

## 🐛 Troubleshooting

### "Failed to generate AI content"
- Check API key is correct
- Verify internet connection
- Check rate limits
- Review Gemini API status

### "Chatbot not responding"
- Check browser console for errors
- Verify API endpoint is accessible
- Check authentication token
- Review server logs

### "Insights not loading"
- Ensure user has elections
- Check database connection
- Verify sufficient data exists
- Review error logs

---

## 📈 Future Enhancements

- [ ] Multi-language support
- [ ] Voice interaction
- [ ] Image analysis for candidates
- [ ] Advanced fraud ML models
- [ ] Custom AI training
- [ ] Sentiment analysis
- [ ] Automated moderation
- [ ] Predictive voter turnout

---

## 📞 Support

For issues or questions:
- Email: kingscreationagency635@gmail.com
- Check server logs: `server/logs/`
- Review API documentation: [Gemini AI Docs](https://ai.google.dev/docs)

---

## 📄 License

These AI features are part of PollSync and follow the same license terms.

**Powered by Google Gemini AI** 🚀
