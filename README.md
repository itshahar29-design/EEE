# 🚀 EDUMEMORY PRO - FRONTEND DASTURCHILAR PLATFORMASI

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/itshahar29-design/e)

> **🌐 Jonli Platforma Havolasi:**  
> 👉 **[https://frontcraft-pro.onrender.com](https://frontcraft-pro.onrender.com)**

O'zbek tilidagi eng mukammal, ochiq va interaktiv **Frontend Loyihalar & Masterclass Platformasi** (200 ta to'liq real portfolio loyihalari va 178 ta chuqur darslar).

Platforma dasturchilar uchun maxsus yaratilgan bo'lib, **YouTube uslubidagi loyihalar katalogi**, **Hover'da avtomatik jonli preview**, **Interaktiv kod studiyasi**, **JSZip orqali 1-bosishda ZIP yuklab olish**, **Ko'p tilli tizim (UZ, RU, EN)** va **PWA (offline)** imkoniyatlariga ega.

---

## 🌟 Asosiy Imkoniyatlar

1. **Jami 200+ ta Real Portfolio Loyihasi**:
   - 🟢 **Boshlang'ich (150 ta)**: Semantik HTML5, CSS3, DOM manipulatsiyasi, LocalStorage, to'liq responsive dizayn.
   - 🟡 **O'rta (50 ta va o'smoqda)**: Hash-routing (SPA), asinxron API, reaktiv State Store, SVG & Canvas diagrammalar, qat'iy form validatsiyasi.
2. **📺 YouTube Uslubidagi Katalog**:
   - Kartalar ustiga borganda (hover) **jonli iframe preview** avtomatik o'ynaydi.
   - 15 ta toifadagi chap kategoriya paneli (*Landing, Dashboard, E-commerce, Admin panel, O'yinlar, Animatsiya, Portfolio, Calculator, CRM/To-do, Chat UI, Clone UI, API loyihalar, Data visualization, Kanban, Editor*).
   - Tepadagi tezkor chip filtrlar (Daraja, Texnologiya, Teglar).
   - **Fuzzy Search** (xato yozganda ham topadi) va klaviaturadagi `/` tugmasi orqali tezkor qidiruv.
3. **💻 Interaktiv Loyiha Studiyasi (Studio Modal)**:
   - **Live Preview**: Desktop (100%), Planshet (768px), Mobil (375px) moslashuvchan rejimlar.
   - **4 ta to'liq tab**:
     - 🖥️ *Preview*: Jonli ishlovchi loyiha.
     - 💻 *Kod*: `HTML`, `CSS`, `JS` alohida syntax preview va 1-bosishda nusxalash.
     - 📖 *Dars*: Maqsad, qadamlar, chuqur kod tahlili, amaliy mashq va *"Darsni yakunlash"* progressi.
     - 📄 *README*: Loyiha to'liq hujjati.
4. **📦 1-Click ZIP Yuklab Olish**:
   - Har bir loyihani brauzerning o'zida `JSZip` yordamida to'liq arxiv holatida (barcha fayllari bilan) yuklab olish.
5. **⚙️ Sozlamalar & PWA**:
   - Dark / Light mavzular.
   - 3 ta to'liq til: 🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English.
   - PWA (`manifest.json` va `sw.js` orqali offline kesh).

---

## 🌐 Render.com ga Joylash (1-Click Deployment)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/itshahar29-design/e)

### 1-Bosishda Avtomatik Deploy Qilish:
Yuqoridagi **"Deploy to Render"** tugmasini yoki quyidagi havolani bosing:  
👉 **[https://render.com/deploy?repo=https://github.com/itshahar29-design/e](https://render.com/deploy?repo=https://github.com/itshahar29-design/e)**

Render avtomatik ravishda `render.yaml` sozlamalarini o'qib, chiroyli havola bilan saytni ishga tushiradi:
🌐 **[https://frontcraft-pro.onrender.com](https://frontcraft-pro.onrender.com)**

### Qo'lda Joylash Sozlamalari:
1. [render.com](https://render.com) ga kiring va **"New Web Service"** ni tanlang.
2. **`itshahar29-design/e`** omborini tanlang.
3. Sozlamalar:
   - **Name**: `frontcraft-pro`
   - **Runtime**: `Node`
   - **Build Command**: (bo'sh qoldiring yoki `npm install`)
   - **Start Command**: `node server.js`
4. **"Deploy Web Service"** tugmasini bosing! Saytingiz `https://frontcraft-pro.onrender.com` manzilida ishlaydi.

---

## 🛠️ Mahalliy (Local) Kompyuterda Ishga Tushirish

```bash
# Serverni ishga tushirish
node server.js
```
Brauzerda oching: `http://localhost:3000`

```bash
# Barcha loyihalarni tekshirish (Validation)
node scripts/validate.js

# Barcha ZIP arxivlarini yig'ish
node scripts/build-zips.js
```

---
&copy; 2026 FrontCraft Pro. Barcha huquqlar himoyalangan.