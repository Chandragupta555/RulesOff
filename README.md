<div align="center">

# 🔥 RulesOff

### Gate's shut. We're open.

**The late-night snack marketplace built exclusively for PEC Chandigarh hostellers.**

*When the mess is closed and the gates are locked, RulesOff connects hungry students with the snacks already sitting a few rooms away.*

[![Live App](https://img.shields.io/badge/Live-rules--off.vercel.app-FF5F1F?style=for-the-badge)](https://rules-off.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

</div>

---

## 🌙 The Problem

It's 1 AM. The PEC mess shut hours ago. Your hostel gate is locked — you're not getting to another block, let alone off campus. But somewhere down the corridor, someone's got an extra Maggi packet they're never going to eat, and you'd trade your next exam's worth of luck for one bite.

**RulesOff exists to close that gap.**

## ⚡ What It Does

RulesOff is a real-time, peer-to-peer snack marketplace — scoped strictly to **your own hostel**, because that's the only place you can physically reach after gates close.

- 📍 **Hostel & block-locked** — see only what's genuinely walkable: your hostel, sorted by actual physical distance (same block beats a far block, always)
- 🛒 **Tonight's Shelf** — a live, aggregated view of everything currently available across your hostel, updating in real time
- 🙋 **Direct requests** — pick the exact room you want to buy from, send a request, get a live accept/decline
- 🔔 **Real notifications** — sellers get pinged (sound + vibration) the moment a request lands, no need to keep the app open
- 🏆 **Leaderboard** — hostels compete for weekly trade supremacy; products get ranked by what's actually moving
- 🗳️ **Wanted, Not In Stock** — vote for what you wish someone would stock tonight
- 🔐 **PEC-only, for real** — Google Sign-In locked to `@pec.edu.in` accounts. No fake profiles, no outsiders.
- 📱 **Installable PWA** — add it to your home screen, it behaves like a native app

## 🧠 The Interesting Engineering Bit

PEC hostel rooms follow a `[Block][Floor][Room]` format (e.g. `A304`, `NB204`) — and blocks aren't connected floor-to-floor, so reaching a different block always means walking down to the ground floor and back up. RulesOff's proximity algorithm models this physical reality:

```
Same block  → distance = |floor difference|
Diff block  → distance = (your floor − 1) + (their floor − 1)
```

Rooms are sorted by true walking cost, not raw room-number proximity — so the closest *reachable* snack always shows up first.

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Firebase Firestore (real-time listeners) |
| Auth | Firebase Auth — Google Sign-In, domain-restricted to `@pec.edu.in` |
| Notifications | Web Notifications API + Service Worker |
| Hosting | Vercel |
| Design | Custom design system — dark mode, neon orange, Lexend typeface |

## 🚀 Core Flow

```
Sign in with PEC Google account
        ↓
Pick your hostel + block + room (locked, 14-day change cooldown)
        ↓
Browse Tonight's Shelf → tap a product → see rooms sorted by real proximity
        ↓
Request from the room you want → seller gets a live notification
        ↓
Accept → meet up / deliver → Mark as Fulfilled → stock updates for everyone
```

## 📂 Project Structure

```
src/
├── screens/          # Route-level screens (Catalog, RoomList, Requests, Profile, Leaderboard...)
├── firebase/         # Auth, Firestore service layer (listings, requests, leaderboard)
├── context/          # UserContext, NotificationContext
├── data/             # Product catalog, proximity/distance logic
├── types/            # Shared TypeScript types
public/
├── sw.js             # Service worker for notifications
├── manifest.json     # PWA manifest
```

## 🛠️ Running Locally

```bash
git clone https://github.com/Chandragupta555/RulesOff.git
cd RulesOff
npm install
npm run dev
```

You'll need your own Firebase project (Auth + Firestore) — drop your config into `src/firebase/config.ts`.

## 🗺️ Roadmap

- [ ] Real product photography for the catalog
- [ ] Cloud Functions–powered background push (works even when the app is fully closed)
- [ ] Block structure for Kurukshetra, Vindhya & Kalpana Chawala hostels
- [ ] Hostel Hall of Fame / founding-member badges
- [ ] Weekly leaderboard auto-reset

## 🎓 Origin Story

Built solo, from scratch, at PEC Chandigarh — designed, iterated, debugged, and shipped as a genuinely used campus tool, not a class project sitting in a repo. Every proximity edge case, every race condition, every "wait, that shouldn't be possible" bug was found and fixed against real hostel geography and real student testing.

---

<div align="center">

**RulesOff** — built for PEC, by PEC.

*The gate may be shut. We're not.*

</div>