# AI Automation + Voice Assistant — Starter Demos

Do chhote, **chalte hue** demos. Koi paid API key nahi chahiye.

---

## 1. Voice Assistant Demo

File: `voice-assistant-demo.html`

Browser mein kholo (mic ke liye **localhost** zaroori hai, `file://` pe mic block ho jata hai):

```powershell
cd C:\Users\DELL\ai-demos
python -m http.server 8899
```

Phir kholo: **http://localhost:8899/voice-assistant-demo.html**

### Kya-kya kar sakte ho
| Button | Kaam |
|---|---|
| **Start call** | Mic on → bolo → agent samjhega aur jawab dega |
| **Play scripted call** | Bina mic ke poora conversation auto-play (demo ke liye best) |
| **Hinglish / English** | Language switch |
| **Voice ON/OFF** | TTS mute |
| Neeche input box | Type karke bhi baat kar sakte ho |

### Andar kya ho raha hai (4 steps)
```
Mic  →  Speech-to-Text  →  Brain (intent + slots)  →  Actions  →  Text-to-Speech
```
- **Intent detection** — "appointment", "order status", "pricing", "human agent"
- **Slot filling** — naam → service → date/time (multi-turn memory)
- **Actions panel** — jo "backend calls" hoti hain: `calendar.check_availability`, `booking.create`, `crm.lead_saved`, `sms.send`
- **TTS** — browser ki built-in awaaz

Ye rules-based brain hai (fast, free, predictable). Production mein yahi jagah **LLM + function calling** lagti hai — baaki poora loop same rehta hai.

---

## 2. Automation Demo

Folder: `automation-demo/`

```powershell
cd C:\Users\DELL\ai-demos\automation-demo
node run-automation.mjs
```

Kya karta hai:
1. `leads.csv` padhta hai (10 leads)
2. Phone validate karta hai
3. Rules se segment karta hai — **HOT / WINBACK / NURTURE**
4. Har segment ke liye personalised Hinglish message banata hai
5. `outbox/messages_*.csv` + `report.json` + `run-log.json` likhta hai

Sample output:
```
HOT 4 · WINBACK 2 · NURTURE 4
Messages ready : 6
Manual time    : ~24 min  →  actual: 11 ms
```

### Isko real banane ke liye sirf 2 cheezein badlo
| Abhi | Production |
|---|---|
| `TEMPLATES` function | OpenAI / Claude API call (personalised message) |
| CSV file likhna | WhatsApp Cloud API / SMTP / HubSpot API |

`RULES` array mein apne business rules likho — wahi automation ka dimaag hai.

---

## 3. OmniDimension (omnidim.io) — kya hai

No-code **voice AI agent builder**. Tum text mein likhte ho ki agent kya kare, wo agent bana deta hai.

**Flow:** Write (prompt se banao) → Test → Add functionalities (workflow builder) → Deploy → Monitor

**Jo cheezein out-of-the-box milti hain:**
- Telephony — Twilio / RingCentral / Vonage / Exotel se apna number
- Integrations — Cal.com, Google Calendar, HubSpot, Salesforce
- Automation — Zapier / Make / **n8n** se trigger
- Messaging — Slack, WhatsApp par transcript + summary
- Multilingual, call transfer, knowledge base, web search
- Free trial, no credit card

**Kab use karo:** jab tumhe **phone calls** chahiye (real number, inbound/outbound) aur tum code nahi likhna chahte.

**Kab khud banao:** jab deep custom logic chahiye, ya cost per minute kam karni ho.

---

## 4. Learning roadmap (2 hafte)

**Week 1 — Automation**
- Day 1–2: `n8n` install karo (free, self-hosted) → 3 workflows banao: Gmail → Sheets, form → Slack, daily report
- Day 3–4: Webhook samjho (`n8n` webhook node + `curl`)
- Day 5: OpenAI API key → n8n mein HTTP node se LLM call
- Day 6–7: Apna use case end-to-end banao

**Week 2 — Voice**
- Day 8–9: OmniDimension pe free agent banao, browser pe test karo
- Day 10: Apna Twilio trial number connect karo
- Day 11–12: Same agent Vapi pe banao, compare karo (latency, cost, quality)
- Day 13–14: Ek real use case — appointment booking ya lead qualification

**Cost reality (approx):**
- STT + LLM + TTS ≈ $0.05–0.15 per minute
- Phone number ≈ $1–2/month + per-minute telephony
- OmniDimension/Vapi ka apna platform fee upar se

---

## 5. Agla step — kya banaayein?

1. **Voice agent** ko real banao (OpenAI Realtime ya OmniDimension) — booking flow ke saath
2. **n8n workflow** jo call ke baad WhatsApp follow-up bheje
3. Dono ko jodo: call → transcript → CRM → WhatsApp

Bolo kaunsa chahiye, main bana deta hoon.
