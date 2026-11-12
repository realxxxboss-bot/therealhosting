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

## 2. ✅ Vercel ko is repo tak access dein  (blocks: demo link)

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

**Steps (step 9 ke baad, jab database jur jaye):**
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

## 8. ⏳ Website ki tasveerein dekh kar approve karein  (blocks: design final)

**Kyun:** Tasveerein Unsplash se li hain (free licence). Jis jagah main kaam karta hoon wahan se Unsplash ki images khulti nahi, is liye maine har tasveer sirf uski description parh kar chuni hai, dekh kar nahi. Aap ko ek dafa dekhna hoga ke har tasveer achi lag rahi hai.

**Steps:**

1. Pehle upar wala step 2 (Vercel access) karein, taake preview link ban sake.
2. Preview link khol kar yeh pages dekhein: Home, Next.js, WordPress, Static, Migration, About, Contact, Blog, Sign in.
3. Jo tasveer pasand na aaye, mujhe sirf page ka naam aur "yeh wali badlo" likh dein. Main nayi laga dunga.
4. Sab tasveeron ki list `/credits` page par hai.

---

## 9. ⏳ Asli database jorein  (blocks: pehla asli client)

**Kyun:** Abhi preview "sample data" par chalta hai jo har restart par reset ho jata hai. Yeh demo ke liye theek hai. Asli client ka data rakhne ke liye ek asli Postgres database chahiye. **Yeh abhi zaroori nahi.** Jab aap asli client lana chahein tab karein. Domain (step 1) pehle le lein to email bhi sath chal jayegi.

**Steps (Vercel par, 5 minute):**

1. **https://vercel.com** par sign in karein aur `therealhosting` project kholein.
2. Upar **Storage** tab → **Create Database** → **Neon** (Postgres) chunein.
3. Region mein **Frankfurt (EU)** chunein, kyun ke hamari Privacy Policy mein likha hai ke data EU mein hai. Free plan theek hai.
4. **Connect to Project** par `therealhosting` chunein. Vercel `DATABASE_URL` khud daal dega. Aap ko koi password copy nahi karna.
5. Ab **Settings → Environment Variables** mein yeh do cheezen khud add karein:
   - `SESSION_SECRET`: koi bhi lamba random text, kam az kam 40 characters. Kisi password generator se bana lein. Isay kahin aur use na karein.
   - `ADMIN_EMAIL`: woh email jis se aap admin panel mein sign in karenge.
6. **Deployments** tab → sab se upar wali deployment ke saamne teen dots → **Redeploy**.
7. Pehli dafa chalne par system aap ka admin account banata hai aur "password chunein" ka link bhejta hai. Jab tak email (Resend) set nahi hai, yeh link Vercel ke **Logs** tab mein milega: search mein `[setup]` likhein, link khol kar password chunein. Link sirf ek dafa chalta hai.

**Mujhe bhejein:** "Database jor diya" — bas. `DATABASE_URL` ya `SESSION_SECRET` chat mein na bhejein.

**Note:** Database jorne ke baad sample accounts (demo/123456) khatam ho jate hain. Sirf asli accounts chalenge.

---

## 10. ⏳ Resend account (asli emails)  (blocks: password reset aur invite emails)

**Kyun:** Password reset, team invite aur invoice ki emails Resend ke zariye jati hain. Is ke liye domain chahiye (step 1), is liye pehle domain lein.

**Steps:**

1. **https://resend.com/signup** par account banayein.
2. **Domains → Add Domain** mein apna domain likhein. Resend jo DNS records dikhaye woh Cloudflare ke DNS mein add karein, phir **Verify** dabayein.
3. **API Keys → Create API Key** (permission: Sending access). Key copy karein.
4. Vercel → **Settings → Environment Variables** mein add karein: `RESEND_API_KEY` (woh key) aur `EMAIL_FROM` (misal: `Zaffre <no-reply@zaffrehost.com>`). Phir Redeploy.

**Mujhe bhejein:** "Resend set ho gaya" — key chat mein na bhejein.

---

## Baad mein (abhi kuch nahi karna)

Yeh Phase 2–3 mein aayenge. Har ek ke poore steps tab yahan add honge:

- Cloudflare API token (DNS + Custom Hostnames + R2)
- Migadu account (client mailboxes)
- UptimeRobot account (monitoring)
- Postgres ko apne server (Coolify) par le jana
- WhatsApp provider (alerts)
