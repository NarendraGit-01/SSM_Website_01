# 🏗️ Srinivasa Steel Metals (SSM) — Website

A modern, production-ready business website for SSM, built with Next.js 16, Tailwind CSS, and Framer Motion.

## 🚀 Quick Start

```powershell
# Navigate to the project
cd C:\Users\Acer\.gemini\antigravity\scratch\ssm-website

# Start the development server
npm.cmd run dev

# Open your browser → http://localhost:3000
```

## 🔐 Admin Access

Go to → **http://localhost:3000/admin/login**
- **Email:** `admin@ssm.com`
- **Password:** `ssm123`

## 📄 Pages

| Page | URL |
|---|---|
| Home | http://localhost:3000/ |
| Services | http://localhost:3000/services |
| Product Catalog | http://localhost:3000/catalog |
| About Us | http://localhost:3000/about |
| Contact | http://localhost:3000/contact |
| Admin Dashboard | http://localhost:3000/admin/dashboard |

## 🛑 Stopping the Server

Press **Ctrl+C** in the terminal. If port is stuck, run:
```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** lucide-react
- **DB (planned):** Supabase
- **Fonts:** Outfit + Inter (Google Fonts)

## 📦 Build for Production

```powershell
npm.cmd run build
```

## 📁 Project Structure

```
ssm-website/
├── app/               ← All pages (Next.js App Router)
├── components/
│   ├── layout/        ← Navbar, Footer
│   └── sections/      ← Hero, ServiceHighlights, WhyChooseUs
└── lib/
    ├── supabase.ts    ← Database client
    └── utils.ts       ← Utility helpers
```
