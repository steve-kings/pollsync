# 💰 AI Features - Pay-Per-Use Model

## Overview

All AI features now use a credit-based payment system to manage API costs and provide value to users.

---

## 💳 Pricing Structure

### 1. **AI Dashboard Insights** - 10 Credits
**Location:** `/dashboard/ai-insights`

**What You Get:**
- Personalized activity summary
- Key highlights of your performance
- Smart recommendations
- Next steps suggestions
- Usage pattern analysis

**How It Works:**
1. User clicks "Generate AI Insights" button
2. System checks if user has ≥10 credits
3. If yes: Deducts 10 credits and generates insights
4. If no: Shows error and link to purchase credits

---

### 2. **AI Fraud Detection** - 10 Credits
**Location:** Election details page (Fraud Detection Panel)

**What You Get:**
- Risk level assessment (Low/Medium/High/Critical)
- Risk score (0-100)
- Detected issues list
- Suspicious activities
- Voting pattern analysis
- Actionable recommendations

**How It Works:**
1. User clicks "Analyze Election" button
2. System checks if user has ≥10 credits
3. If yes: Deducts 10 credits and analyzes election
4. If no: Shows error and link to purchase credits

---

### 3. **AI Chatbot** - FREE (Limited)
**Location:** Floating button on all pages

**Free Tier:**
- 5 messages per day
- Resets every 24 hours
- Basic support and guidance

**Unlimited Access:**
- Purchase any credit package
- Unlimited chatbot messages
- No daily limits

**How It Works:**
1. User sends message to chatbot
2. System tracks daily usage count
3. If count < 5: Processes message
4. If count ≥ 5: Shows limit reached message
5. Counter resets at midnight

---

## 🔧 Technical Implementation

### Database Changes

**User Model** (`server/models/User.js`):
```javascript
{
    // Existing fields...
    
    // AI Chatbot usage tracking
    chatbotUsage: {
        count: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now }
    }
}
```

### API Endpoints

**AI Insights:**
```
GET /api/ai/insights/dashboard
- Requires: Authentication
- Cost: 10 credits
- Returns: Insights + remaining credits
```

**Fraud Detection:**
```
GET /api/ai/fraud/analyze/:electionId
- Requires: Authentication
- Cost: 10 credits
- Returns: Analysis + remaining credits
```

**Chatbot:**
```
POST /api/ai/chatbot/message
- Requires: None (public)
- Cost: Free (5/day limit)
- Returns: Response + remaining messages
```

---

## 📱 User Experience

### AI Insights Page

**Before Purchase:**
```
┌─────────────────────────────────────┐
│  AI Dashboard Insights              │
│  Powered by Gemini AI               │
├─────────────────────────────────────┤
│  Cost: 10 Voter Credits             │
│  Your Credits: 5                    │
│                                     │
│  [Insufficient Credits]             │
│  You need 5 more credits            │
│  [Buy Credits →]                    │
└─────────────────────────────────────┘
```

**After Purchase:**
```
┌─────────────────────────────────────┐
│  AI Dashboard Insights              │
│  Powered by Gemini AI               │
├─────────────────────────────────────┤
│  Cost: 10 Voter Credits             │
│  Your Credits: 50                   │
│                                     │
│  [Generate AI Insights (10 Credits)]│
└─────────────────────────────────────┘
```

**After Generation:**
```
┌─────────────────────────────────────┐
│  ✅ Insights Generated!             │
│  10 credits deducted                │
│  Remaining: 40 credits              │
├─────────────────────────────────────┤
│  📊 Summary                         │
│  Your election activity shows...    │
│                                     │
│  ⭐ Key Highlights                  │
│  1. High voter engagement           │
│  2. Consistent election creation    │
│                                     │
│  💡 Recommendations                 │
│  - Consider bulk packages           │
│  - Schedule elections in advance    │
│                                     │
│  ✅ Next Steps                      │
│  1. Create your next election       │
│  2. Review pricing options          │
└─────────────────────────────────────┘
```

### Chatbot Experience

**Free User (Messages 1-5):**
```
User: How do I create an election?
Bot: To create an election, go to your dashboard...
     (You have 4 free messages remaining today)
```

**Free User (Message 6+):**
```
User: How do I add voters?
Bot: ⚠️ Daily free chatbot limit reached (5 messages).
     Purchase credits for unlimited access.
     Reset time: Tomorrow at 12:00 AM
```

**Paid User:**
```
User: How do I create an election?
Bot: To create an election, go to your dashboard...
     (Unlimited messages available)
```

---

## 💡 Benefits

### For Users:
1. **Pay only for what you use** - No subscription fees
2. **Transparent pricing** - Know exactly what each feature costs
3. **Free chatbot** - Basic support without payment
4. **Flexible** - Use AI features when needed

### For Platform:
1. **Cost control** - API costs covered by user payments
2. **Revenue generation** - Additional income stream
3. **Fair usage** - Prevents API abuse
4. **Scalable** - Can adjust pricing as needed

---

## 🎯 User Journey

### New User:
1. Signs up → Gets 0 credits
2. Sees AI features but can't use them
3. Uses free chatbot (5 messages/day)
4. Purchases credits to unlock AI features

### Existing User:
1. Already has credits from packages
2. Can immediately use AI features
3. Credits deducted per use
4. Purchases more when needed

---

## 📊 Credit Deduction Flow

```
User Action → Check Credits → Deduct → Generate → Return Result
                    ↓
              Insufficient?
                    ↓
            Show Error + Buy Link
```

### Example Code:
```javascript
// Check credits
if (user.sharedCredits < 10) {
    return res.status(402).json({ 
        message: 'Insufficient credits',
        required: 10,
        available: user.sharedCredits
    });
}

// Deduct credits
user.sharedCredits -= 10;
user.creditHistory.push({
    type: 'deduction',
    credits: 10,
    reason: 'AI Dashboard Insights',
    date: new Date()
});
await user.save();

// Generate insights
const insights = await generateInsights();

// Return with remaining credits
res.json({
    ...insights,
    creditsUsed: 10,
    remainingCredits: user.sharedCredits
});
```

---

## 🔒 Security & Validation

### Credit Checks:
- ✅ Server-side validation (never trust client)
- ✅ Atomic operations (deduct + save together)
- ✅ Transaction history tracking
- ✅ Error handling for insufficient credits

### Rate Limiting:
- ✅ Chatbot: 5 messages/day for free users
- ✅ Daily counter reset at midnight
- ✅ Unlimited for users with credits

### API Protection:
- ✅ Authentication required for paid features
- ✅ User ownership verification
- ✅ Input validation
- ✅ Error handling

---

## 📈 Future Enhancements

1. **Credit Packages:**
   - AI-specific packages (e.g., "10 AI Analyses for 80 credits")
   - Bulk discounts for AI features

2. **Subscription Plans:**
   - Monthly AI unlimited access
   - Premium tier with all AI features

3. **Usage Analytics:**
   - Track which AI features are most popular
   - Optimize pricing based on usage

4. **More AI Features:**
   - Sentiment analysis (5 credits)
   - Automated reports (15 credits)
   - Predictive analytics (20 credits)

---

## 🎉 Summary

**AI Features Implemented:**
- ✅ AI Dashboard Insights (10 credits)
- ✅ AI Fraud Detection (10 credits)
- ✅ AI Chatbot (Free: 5/day, Unlimited with credits)

**Key Features:**
- ✅ Pay-per-use model
- ✅ Credit deduction system
- ✅ Usage tracking
- ✅ Error handling
- ✅ User-friendly UI
- ✅ Transparent pricing

**User Benefits:**
- 💰 Only pay for what you use
- 🆓 Free chatbot for basic support
- 🎯 Clear pricing (10 credits per feature)
- 📊 Valuable AI insights
- 🛡️ Fraud protection

**Platform Benefits:**
- 💵 Revenue from AI features
- 🔒 API cost control
- 📈 Scalable model
- ⚖️ Fair usage policy

---

## 📞 Support

For questions about AI features pricing:
- Email: kingscreationagency635@gmail.com
- Check: `/pricing` page for credit packages
- View: Credit history in dashboard

---

**Powered by Google Gemini 1.5 Flash** 🚀
