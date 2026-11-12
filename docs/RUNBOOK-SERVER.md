# Runbook: pehla server (Hetzner + Coolify + Cloudflare)

Yeh guide aap (owner) ke liye hai. Har step copy-paste ke qabil hai. Jahan "Mujhe bhejein" likha hai, wahan sirf "ho gaya" likh dein. **Koi password, API key ya token chat mein kabhi na bhejein.** Woh hamesha platform ki settings mein jate hain.

Andaza: 60 se 90 minute, ek hi baithak mein.

Pehle se chahiye:

- Domain liya hua aur Cloudflare par (OWNER-ACTIONS #1).
- Ek card jis se Hetzner ka monthly bill ho sake.
- Laptop par terminal (Windows: PowerShell, Mac: Terminal).

Is guide ke aakhir mein aap ke paas hoga: ek EU server jis par Coolify chal raha hai, Cloudflare se jura hua, roz ka off-site backup, aur Zaffre dashboard ke liye teen settings (Coolify token, Cloudflare token, UptimeRobot key) jo Vercel ya Coolify ki settings mein jayengi.

---

## Hissa A: Server kharidna (Hetzner)

1. **https://accounts.hetzner.com/signUp** par account banayein. Hetzner pehli dafa ID verification maang sakta hai. Yeh normal hai.
2. Sign in ke baad **https://console.hetzner.cloud** kholein → **New project** → naam `zaffre`.
3. Project ke andar **Add Server**:
   - **Location:** Falkenstein ya Nuremberg (Germany). Yeh hamari Privacy Policy se match karta hai ("data EU mein hai").
   - **Image:** Ubuntu 24.04.
   - **Type:** **Dedicated vCPU** tab → kam az kam 4 vCPU aur 16 GB RAM wala plan. Price us waqt page par dekhein. Shuru ke 6 sites ke liye yeh kaafi hai.
   - **Networking:** IPv4 aur IPv6 dono on rehne dein.
   - **SSH key:** neeche Hissa B ka step 1 pehle kar lein, phir yahan **Add SSH key** se public key paste karein.
   - **Backups:** on kar dein (thora sa extra kharcha, poore server ki weekly copy).
   - **Name:** `zaffre-eu-1`.
4. **Create & Buy now**. Ek minute mein server ka IP address nazar aayega. Isay note kar lein.

**Mujhe bhejein:** Server ki location aur plan ka naam, aur IP address. (IP secret nahi hai.)

## Hissa B: Server tak pohanchna (SSH)

1. Apne laptop par SSH key banayein (agar pehle se nahi):

   ```bash
   ssh-keygen -t ed25519 -C "zaffre-admin"
   ```

   Har sawal par Enter dabayein, lekin **passphrase zaroor rakhein**. Phir public key dikhayein aur copy karein:

   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Server par login karein (`SERVER_IP` ki jagah apna IP):

   ```bash
   ssh root@SERVER_IP
   ```

3. Server ko update karein aur basic hifazat on karein:

   ```bash
   apt update && apt -y upgrade
   apt -y install unattended-upgrades fail2ban
   dpkg-reconfigure -plow unattended-upgrades
   ```

4. Password se login band karein (sirf SSH key chalegi):

   ```bash
   sed -i 's/^#\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
   systemctl restart ssh
   ```

   Ab ek **naye** terminal mein dobara `ssh root@SERVER_IP` karke dekhein ke login ho raha hai, phir purana terminal band karein.

## Hissa C: Coolify install karna

1. Server par yeh ek command chalayein (Coolify ka official installer):

   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
   ```

   5 se 10 minute lagte hain. Aakhir mein ek link dikhayega jaisa `http://SERVER_IP:8000`.

2. Woh link browser mein kholein aur **foran** admin account banayein (jo pehle banata hai wohi admin banta hai). Mazboot password, password manager mein save karein.
3. Coolify mein **Settings → Instance Domain** mein `https://coolify.ZAFFRE_DOMAIN` likhein (misal `https://coolify.zaffrehost.com`). DNS Hissa D mein banega.

## Hissa D: Cloudflare DNS

Cloudflare dashboard → apna domain → **DNS → Records → Add record**. Har line ke liye ek record:

| Type | Name | Content | Proxy |
| --- | --- | --- | --- |
| A | `coolify` | SERVER_IP | DNS only (grey) |
| A | `edge` | SERVER_IP | Proxied (orange) |
| A | `app` | SERVER_IP | Proxied (orange) |

- `coolify` Coolify ka apna panel hai.
- `edge` woh pata hai jahan clients apne domains point karenge.
- `app` Zaffre ka dashboard hai jab woh Vercel se hamare server par aayega.

Phir **SSL/TLS → Overview** mein mode **Full (strict)** chunein.

## Hissa E: Firewall

Hetzner Console → **Firewalls → Create Firewall** → naam `zaffre-web`. Inbound rules:

| Port | Kis ke liye | Source |
| --- | --- | --- |
| 22 | SSH | Sirf aap ka IP (agar aap ka IP badalta rehta hai to "Any", fail2ban hifazat karta hai) |
| 80, 443 | Websites | Any |
| 8000 | Coolify panel (pehle din) | Sirf aap ka IP |

Firewall ko `zaffre-eu-1` server par **Apply** karein. Jab `https://coolify.ZAFFRE_DOMAIN` chal jaye, port 8000 wali rule hata dein.

## Hissa F: Backups (Cloudflare R2)

1. Cloudflare → **R2 Object Storage** → **Create bucket** → naam `zaffre-backups`, location hint **EU**.
2. R2 → **Manage API Tokens → Create API token** → permission **Object Read & Write**, sirf `zaffre-backups` bucket. Access Key ID aur Secret Access Key milenge.
3. Coolify → **Storages → Add** → S3 compatible:
   - Endpoint: R2 page par dikhaya gaya S3 endpoint
   - Bucket: `zaffre-backups`
   - Access key aur secret: step 2 wale
   - **Validate** dabayein.
4. Har database ke **Backups** tab mein schedule `0 3 * * *` (roz raat 3 baje) aur yeh storage chunein.

Hetzner ki apni weekly backup (Hissa A) poore server ki hai. R2 wali roz ki aur alag company ke paas hai, is liye dono rakhein.

## Hissa G: Zaffre ke liye teen tokens

Yeh teeno **settings mein** jate hain (Vercel → Settings → Environment Variables, ya baad mein Coolify mein Zaffre app ki Environment Variables). Chat mein nahi.

1. **Coolify API token:** Coolify → **Keys & Tokens → API tokens** → naam `zaffre-dashboard`, permission **write** (deploy bhi chahiye) → token copy karein.
   - `COOLIFY_API_URL` = `https://coolify.ZAFFRE_DOMAIN`
   - `COOLIFY_API_TOKEN` = woh token
2. **Cloudflare API token:** Cloudflare → **My Profile → API Tokens → Create Token → Custom token**. Permissions:
   - Zone → **DNS** → Edit
   - Zone → **SSL and Certificates** → Edit (custom hostnames ke liye)
   - Zone Resources: sirf aap ka domain
   - `CLOUDFLARE_API_TOKEN` = woh token
   - `CLOUDFLARE_ZONE_ID` = domain ke **Overview** page par neeche daayein taraf "Zone ID" (yeh secret nahi)
   - `EDGE_HOSTNAME` = `edge.ZAFFRE_DOMAIN` (Hissa D wala record)
3. **Cloudflare for SaaS:** domain → **SSL/TLS → Custom Hostnames** → plan enable karein (pehle 100 hostnames free). **Fallback Origin** mein `edge.ZAFFRE_DOMAIN` likhein.
4. **UptimeRobot:** **https://uptimerobot.com/signUp** → **Integrations & API → Main API key** → copy.
   - `UPTIMEROBOT_API_KEY` = woh key

Saari settings daalne ke baad `ADAPTER_MODE` = `live` kar dein aur Redeploy karein. Live mode ke liye asli database (OWNER-ACTIONS #9) pehle se jura hona zaroori hai.

Phir admin panel ke **Overview** page par "Connections" mein har cheez ke saamne **Connected** likha aana chahiye. Jis ki setting missing ho, wahan "Not connected" aur missing setting ka naam likha hoga. Us hisse mein clients ko "not connected" ka message milta hai, demo data kabhi nahi.

5. **Status page ke monitors (UptimeRobot):** UptimeRobot mein **New monitor → HTTP(s)** se yeh banayein. Naam bilkul aise rakhein, kyun ke status page naam se pehchanta hai:
   - `zaffre:dashboard` → `https://app.ZAFFRE_DOMAIN`
   - `zaffre:web` → kisi ek client site ka pata (pehli site live hone ke baad)

   Baqi services (deploys, DNS, backups, email) "no data" dikhayengi jab tak un ka monitor na ho. Yeh jaan boojh kar hai: andaze ke number nahi dikhate.

Har client site ke liye (yeh kaam main migration ke waqt aap ke saath karunga): Coolify mein site ki app banne ke baad us ka **uuid** (app ke URL mein hota hai) admin panel → **Sites** → "Server app" khaane mein paste karke **Link** dabayein. Isi se us site ka uptime monitor bhi ban jata hai.

**Mujhe bhejein:** "Hissa G ho gaya". Main phir dashboard se ek test site bana kar poora rasta check karunga.

---

## Jab kuch ghalat ho

| Masla | Kya karein |
| --- | --- |
| `ssh` par "Permission denied" | Hetzner Console → server → **Rescue** tab se password reset, ya SSH key dobara add karein. |
| Coolify ka link nahi khulta | Firewall mein port 8000 aap ke IP ke liye khula hai? Server par `docker ps` chala kar dekhein ke `coolify` container chal raha hai. |
| Site par "SSL error" | Cloudflare SSL mode **Full (strict)** hai? Coolify mein domain `https://` se likha hai? |
| Server bilkul band | Hetzner Console → server → **Power** → Reset. Phir mujhe batayein. |

Kisi bhi step par atak jayein to us step ka number aur screen ka screenshot bhej dein (token ya password wala hissa chhupa kar).
