# Owner actions

Yeh woh kaam hain jo sirf aap (owner) kar sakte hain: kuch kharidna, account banana, DNS, secrets, ya koi asli business fact.
Har item mein: **kyun zaroori hai**, **steps (click-by-click)**, aur **mujhe wapas kya bhejna hai**.

> **Kabhi bhi koi password, API key ya secret chat mein paste na karein.** Hamesha platform ki "Environment Variables / Secrets" setting mein daalein. Main sirf yeh poochunga ke "ho gaya ya nahi".

Status: ⏳ = baaki, ✅ = ho gaya. Sab se zaroori upar hain.

---

## 1. ⏳ Domain kharidein: `zaffrehost.com`  (blocks: launch, email, SSL)

**Kyun:** Hamara brand naam **Zaffre** hai (wajah: [DECISIONS.md D-001](./DECISIONS.md)). Website, client emails aur dashboard sab is domain par chalenge.

**Steps:**
1. Browser mein **https://dash.cloudflare.com/sign-up** kholein aur apna account banayein (email + password). Agar account pehle se hai to login karein.
2. Left menu mein **Domain Registration → Register Domains** par click karein.
3. Search box mein `zaffrehost.com` likhein aur **Search** dabayein.
4. Agar "Available" aaye: **Purchase** dabayein, 1 saal chunein, contact details bharein, aur card se payment karein.
   - Cloudflare registrar "at-cost" price leta hai, renewal par bhi wohi price. (Hamari "no renewal jump" policy ke saath match.)
5. Agar `zaffrehost.com` available **nahi** hai: isi tarah `getzaffre.com` try karein, phir `zaffre.host`. Jo pehla mile woh le lein.
6. **WHOIS privacy** on rehne dein (Cloudflare mein default on hota hai).

**Mujhe bhejein:** Kaunsa domain liya (sirf domain ka naam).

---

## 2. ⏳ Vercel ko is repo tak access dein  (blocks: demo link)

**Kyun:** Vercel account pehle se connected hai, lekin Vercel ki GitHub app ko `therealhosting` repo dekhne ki ijazat nahi hai. Ijazat milte hi main khud project banaunga, settings daalunga aur preview link bhej dunga. Asal hosting baad mein hamare apne server (Coolify) par hogi.

**Steps (2 minute):**
1. **https://github.com/settings/installations** kholein (GitHub mein sign in hon).
2. List mein **Vercel** ke saamne **Configure** dabayein.
3. Neeche **Repository access** section mein:
   - ya **All repositories** chunein,
   - ya **Only select repositories** → **Select repositories** → `therealhosting` chunein.
4. **Save** dabayein.

Agar list mein Vercel nahi hai: **https://github.com/apps/vercel** kholein → **Install** (ya **Configure**) → `realxxxboss-bot` account → `therealhosting` repo chunein → **Install**.

**Mujhe bhejein:** "Vercel access de diya" — bas. Koi password ya key chat mein na bhejein; secret settings main khud Vercel mein daal dunga.

---

## 3. ⏳ VPS server rent karein (monthly billing)  (blocks: Phase 3, real hosting)

**Kyun:** Clients ki sites isi server par chalengi. Monthly billing taake koi lambi commitment na ho. Recommendation: **Hetzner Cloud**, **dedicated vCPU (CCX line)**, location **Germany** (Falkenstein ya Nuremberg). Wajah: UK client ke qareeb, EU GDPR ke under, achi price/performance. ([DECISIONS.md D-008](./DECISIONS.md))

**Abhi zaroori nahi** — Phase 2 tak demo mock data par chalta hai. Jab Phase 3 shuru ho, main yaad dilaunga. Steps tab [RUNBOOK-SERVER.md] mein copy-paste form mein honge.

**Mujhe bhejein (tab):** Server ki location aur plan ka naam.

---

## 4. ⏳ Asli business facts (jahan `TODO(confirm)` likha hai)

**Kyun:** Hum koi fact khud nahi banate. Yeh cheezen website par placeholder ke taur par hain:

| Field | Kahan use hota hai | Abhi kya hai |
| --- | --- | --- |
| Company ka legal naam | Terms, Privacy, footer | `TODO(confirm)` |
| Business address | Contact, legal pages | Nahi dikhaya (jab tak company register na ho) |
| Support email | Contact, emails | `support@zaffrehost.com` (domain milne ke baad kaam karega) |
| WhatsApp business number | Contact page, dashboard | `TODO(confirm)` — button disabled |
| Governing law (kis mulk ka qanoon) | Terms of Service | `TODO(confirm)` |
| Refund window (din) | Refund Policy | Abhi 14 din likha hai, confirm karein |

**Steps:** Har line ke liye mujhe sirf jawab likh dein (e.g. "WhatsApp: +44 …"). Main config mein daal dunga. **Apna personal naam ya ghar ka address na dein** — sirf company ki details.

**Note (company registration):** Baad mein **UK Ltd** (Companies House, ~£50, online) ya **US LLC** (e.g. Wyoming/Delaware via Stripe Atlas ya Firstbase) register karne se: (a) ek asli business address mil jata hai jo legal pages par likha ja sakta hai, aur (b) **Stripe se card payments** on ho jati hain. Tab tak payments manual (bank transfer / Wise) hain. Yeh decision aapka hai; jab chahein batayein, main poore steps likh dunga.

---

## 5. ⏳ Payment details (bank / Wise) admin panel mein daalein  (blocks: pehla invoice)

**Kyun:** Clients invoice pay karte waqt yeh details dekhenge.

**Steps (Phase 2 ke baad, jab login asli ho):**
1. `https://<aapka-domain>/admin/payment-methods` kholein.
2. **Add method** → "Wise" ya "Bank transfer" chunein.
3. Account name, IBAN / account number, SWIFT ya Wise email bharein → **Save**.

Demo mein abhi sample (fake) details hain jo "DEMO" likhe hue hain.

**Mujhe bhejein:** "Payment methods add kar diye" — details khud nahi.

---

## 6. ⏳ Social handles reserve karein

**Kyun:** Brand protection. Yeh naam koi aur na le le.

**Steps:** In sab par `zaffrehost` (ya agar woh na mile to `zaffre.host` / `getzaffre`) se account banayein:
1. https://x.com/i/flow/signup
2. https://www.linkedin.com/company/setup/new/ (Company page)
3. https://www.instagram.com/accounts/emailsignup/
4. https://github.com/organizations/new (organization naam: `zaffrehost`)

**Mujhe bhejein:** Kaunse handles mile.

---

## 7. ⏳ Trademark quick check (UK + EU)

**Kyun:** Marketing par paisa lagane se pehle confirm karna ke "Zaffre" naam hosting (class 42) mein kisi aur ka nahi.

**Steps:**
1. **https://trademarks.ipo.gov.uk/ipo-tmtext** kholein → "Trade mark text" mein `ZAFFRE` likhein → **Search**. Class 42 / 38 wale results dekhein.
2. **https://www.tmdn.org/tmview/** kholein → search mein `ZAFFRE` → results mein "Nice class" 42 filter karein.
3. Agar class 42 mein koi live mark ho to mujhe batayein; hum fallback naam par jayenge.

**Mujhe bhejein:** "Class 42 mein kuch nahi mila" ya screenshot.

---

## Baad mein (abhi kuch nahi karna)

Yeh Phase 2–3 mein aayenge. Har ek ke poore steps tab yahan add honge:

- Cloudflare API token (DNS + Custom Hostnames + R2)
- Resend account (platform emails) + domain verify
- Migadu account (client mailboxes)
- UptimeRobot account (monitoring)
- Postgres database (Coolify par ya managed)
- WhatsApp provider (alerts)
