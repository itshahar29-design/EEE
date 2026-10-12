# 🚀 FRONTCRAFT PRO - FRONTEND DASTURCHILAR PLATFORMASI

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/itshahar29-design/e)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/itshahar29-design/e)

> **🌐 Jonli Platforma Havolalari:**  
> 👉 Netlify: **[https://app.netlify.com/start/deploy?repository=https://github.com/itshahar29-design/e](https://app.netlify.com/start/deploy?repository=https://github.com/itshahar29-design/e)**  
> 👉 Render: **[https://frontcraft-pro.onrender.com](https://frontcraft-pro.onrender.com)**

O'zbek tilidagi eng mukammal, ochiq va interaktiv **Frontend Loyihalar & Masterclass Platformasi** (300 ta to'liq real portfolio loyihalari va 278 ta chuqur darslar).

Platforma dasturchilar uchun maxsus yaratilgan bo'lib, **YouTube uslubidagi loyihalar katalogi**, **Hover'da avtomatik jonli preview**, **Interaktiv kod studiyasi**, **JSZip orqali 1-bosishda ZIP yuklab olish**, **Ko'p tilli tizim (UZ, RU, EN)** va **PWA (offline)** imkoniyatlariga ega.

---

## ⚡ Netlify'ga Joylash (1-Click Deployment)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/itshahar29-design/e)

### 1-Bosishda Netlify orqali Ishga Tushirish:
1. Yuqoridagi **"Deploy to Netlify"** tugmasini bosing:
   👉 **[Netlify Orqali Ishga Tushirish](https://app.netlify.com/start/deploy?repository=https://github.com/itshahar29-design/e)**
2. GitHub hisobingiz bilan kiring va **"Save & Deploy"** ni bosing.
3. Loyiha avtomatik tarzda `netlify.toml` faylidagi sozlamalar bo'yicha yig'iladi va bir necha soniyada bepul `https://...netlify.app` subdomeni bilan jonli efirga chiqadi!

### Netlify Qo'lda Sozlash Qoidalari:
- **Build command**: `node scripts/validate.js`
- **Publish directory**: `.` (yoki bo'sh qoldiring)
- **Node version**: `20`

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