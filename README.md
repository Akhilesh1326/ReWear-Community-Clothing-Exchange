# 👕 ReWear – Community Clothing Exchange 🌍

**ReWear** is a web-based platform that encourages sustainable fashion by enabling users to **swap or redeem unused clothes** through a unique point-based system. Our goal is to **reduce textile waste**, promote mindful consumption, and build a **community around conscious clothing reuse**.

---

## 🌟 Features

### 🏠 Landing Page
- Platform introduction with beautiful UI
- Calls-to-action: `Start Swapping`, `Browse Items`, `List an Item`
- Featured Items Carousel

### 👤 User Dashboard
- View profile details and points balance
- Uploaded items overview
- Track active and completed swaps

### 📦 Item Detail Page
- Image gallery & full description
- Uploader profile
- Options: `Request Swap` or `Redeem via Points`
- Availability status

### ➕ Add New Item
- Upload images & details: title, category, type, size, condition, tags
- Submit item for listing
- Add a "Soul Tag" (emotional note about the clothing)

### 🔒 User Authentication
- Secure signup/login using email & password
- Auth session management

### 👮 Admin Panel
- Approve or reject item listings
- Remove spam or inappropriate content
- Lightweight dashboard for moderation

---

## 🪙 Point System

ReWear uses a **smart points model**:

- Points are calculated based on:
  - Item type (e.g., shirt = 5 pts, jacket = 12 pts)
  - Condition multiplier
  - Brand quality
  - Sustainability & upload quality bonuses

- Users can:
  - **Earn points** when others redeem their items
  - **Spend points** to redeem clothing from others
  - Get **eco-points** for direct swaps

---

## 💡 Why ReWear?

- 👗 Reduce landfill waste by extending the life of clothes
- 💬 Tell the story of every item through "Soul Tags"
- 🌍 Make second-hand a first choice through community-driven reuse
- 🧠 Smart AI-based fashion impact tracking (optional future scope)

---

## 🛠️ Tech Stack

- **Frontend**: React + TailwindCSS + Framer Motion
- **Backend**: Node.js / Express / Firebase (or Supabase)
- **Authentication**: Firebase Auth / JWT
- **Database**: Firestore / Supabase DB
- **Image Storage**: Firebase Storage / Cloudinary
- **Deployment**: Vercel / Netlify

---

## 🚀 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/your-username/rewear.git
cd rewear

# Install dependencies
npm install

# Start the dev server
npm run dev
