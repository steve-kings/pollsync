# 💳 PollSync Credit System - Complete Guide

## Overview

PollSync uses a **voter credit system** where credits are used for:
1. **Creating elections** (based on voter limit)
2. **AI features** (10 credits per use)

**Credits are NOT deducted for voting!** Once an election is created, unlimited votes can be cast within the voter limit.

---

## 🎯 How Credits Work

### 1. **Creating Elections**
When you create an election, credits are deducted based on the voter limit:

```
Voter Limit = Credits Needed

Examples:
- 50 voters = 50 credits
- 200 voters = 200 credits
- Unlimited = Special unlimited package
```

**Important:** Credits are deducted ONCE when creating the election, not per vote!

---

### 2. **Voting (FREE)**
Once an election is created:
- ✅ Voters can vote for FREE
- ✅ No credits deducted per vote
- ✅ Unlimited votes within the voter limit
- ✅ Real-time results

**Example:**
```
You create election with 100 voter limit
→ 100 credits deducted at creation
→ 100 people can vote
→ NO additional credits deducted when they vote
```

---

### 3. **AI Features (10 Credits Each)**

#### AI Dashboard Insights - 10 Credits
**What it does:**
- Analyzes your election activity
- Provides personalized recommendations
- Shows key highlights
- Suggests next steps

**How to use:**
1. Go to `/dashboard/ai-insights`
2. Click "Generate AI Insights (10 Credits)"
3. 10 credits deducted ONCE
4. View your insights

#### AI Fraud Detection - 10 Credits
**What it does:**
- Analyzes voting patterns
- Detects suspicious activity
- Provides risk assessment
- Gives recommendations

**How to use:**
1. Go to election details page
2. Click "Analyze Election (10 Credits)"
3. 10 credits deducted ONCE
4. View fraud analysis

#### AI Chatbot - FREE (Limited)
**What it does:**
- Answers questions about PollSync
- Provides support 24/7
- Helps with platform features

**Free tier:**
- 5 messages per day
- Resets every 24 hours
- No credit deduction

**Unlimited:**
- Purchase any credit package
- Unlimited chatbot access
- No daily limits

---

## 💰 Credit Deduction Flow

### Creating Election:
```
1. User sets voter limit (e.g., 100)
2. System checks: Does user have 100 credits?
   ├─ YES → Deduct 100 credits → Create election
   └─ NO → Show error → Redirect to pricing
```

### Voting:
```
1. Voter submits vote
2. System checks: Is election active? Is voter allowed?
   ├─ YES → Record vote → NO CREDIT DEDUCTION
   └─ NO → Show error
```

### AI Features:
```
1. User clicks "Generate AI Insights"
2. System checks: Does user have 10 credits?
   ├─ YES → Deduct 10 credits → Generate insights
   └─ NO → Show error → Link to pricing
```

---

## 📊 Credit Usage Examples

### Example 1: Small Organization
**Purchase:** 50 credits (KES 500)

**Usage:**
- Create election with 30 voters → 30 credits used
- Remaining: 20 credits
- Use AI Insights → 10 credits used
- Remaining: 10 credits
- Use AI Fraud Detection → 10 credits used
- Remaining: 0 credits

**Total:** 1 election + 2 AI features

---

### Example 2: Medium Organization
**Purchase:** 200 credits (KES 1,500)

**Usage:**
- Create election 1 with 50 voters → 50 credits used
- Create election 2 with 100 voters → 100 credits used
- Remaining: 50 credits
- Use AI Insights 3 times → 30 credits used
- Remaining: 20 credits
- Use AI Fraud Detection 2 times → 20 credits used
- Remaining: 0 credits

**Total:** 2 elections + 5 AI features

---

### Example 3: Large Organization
**Purchase:** Unlimited package (KES 5,000)

**Usage:**
- Create unlimited voter election → 1 package used
- Unlimited votes can be cast
- Still need credits for AI features
- Purchase additional credits for AI

**Note:** Unlimited packages are for voter limits, not AI features!

---

## 🔍 Checking Your Credits

### Dashboard:
```
┌─────────────────────────────────┐
│  Your Total Credits             │
├─────────────────────────────────┤
│  Recent Purchases: 50           │
│  Previous Purchases: 0          │
│  Unlimited: 0                   │
├─────────────────────────────────┤
│  Total Available: 50 credits    │
└─────────────────────────────────┘
```

### Credit History:
View all credit transactions:
- Purchases (additions)
- Election creations (deductions)
- AI feature usage (deductions)

---

## ⚠️ Important Notes

### Credits are NOT deducted for:
- ❌ Casting votes
- ❌ Viewing results
- ❌ Managing elections
- ❌ Adding candidates
- ❌ Managing voters
- ❌ Viewing analytics (non-AI)

### Credits ARE deducted for:
- ✅ Creating elections (voter limit amount)
- ✅ AI Dashboard Insights (10 credits)
- ✅ AI Fraud Detection (10 credits)

### Chatbot:
- 🆓 Free: 5 messages/day
- 💳 Unlimited: With any credit purchase

---

## 🛒 Purchasing Credits

### Available Packages:
1. **Basic** - 50 credits - KES 500
2. **Standard** - 200 credits - KES 1,500
3. **Premium** - 500 credits - KES 3,000
4. **Enterprise** - Unlimited voters - KES 5,000

### How to Purchase:
1. Go to `/pricing`
2. Select package
3. Pay via M-PESA
4. Credits added instantly
5. Start creating elections or using AI

---

## 🔒 Credit Security

### Server-Side Validation:
- ✅ All credit checks on server
- ✅ Cannot bypass with client code
- ✅ Atomic transactions (deduct + save together)
- ✅ Full audit trail in credit history

### Transaction History:
Every credit change is logged:
```javascript
{
    type: 'deduction',
    credits: 10,
    reason: 'AI Dashboard Insights',
    date: '2024-01-15T10:30:00Z'
}
```

---

## 📈 Credit Optimization Tips

### 1. Plan Your Elections:
- Calculate total voters needed
- Purchase appropriate package
- Avoid buying too many credits

### 2. Use AI Wisely:
- AI features cost 10 credits each
- Use when you need insights
- Don't generate repeatedly

### 3. Bulk Purchases:
- Larger packages = better value
- Premium: 500 credits for KES 3,000
- Better than 10x Basic packages

### 4. Unlimited Package:
- Best for large elections
- One-time use per election
- Still need credits for AI

---

## 🎉 Summary

**Credit System:**
- 💰 Buy credits once
- 🗳️ Create elections (voter limit = credits)
- 🆓 Voting is FREE
- 🤖 AI features cost 10 credits each
- 💬 Chatbot: 5 free messages/day

**Key Points:**
1. Credits deducted ONCE when creating election
2. NO credits deducted when people vote
3. AI features require 10 credits per use
4. Chatbot has free tier (5 msgs/day)
5. All transactions logged in history

**Fair & Transparent:**
- ✅ Pay only for what you use
- ✅ No hidden fees
- ✅ Clear pricing
- ✅ Full transaction history
- ✅ Instant credit updates

---

## 📞 Support

Questions about credits?
- Email: kingscreationagency635@gmail.com
- Check: `/pricing` for packages
- View: Credit history in dashboard
- Track: Real-time credit updates

---

**PollSync - Fair, Transparent, Affordable** 🚀
