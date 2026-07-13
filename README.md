# Sack Stack

<!-- Shields -->
<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-0d7d6c" alt="Version 1.0.0">
  <img src="https://img.shields.io/badge/license-MIT-0d7d6c" alt="License MIT">
  <img src="https://img.shields.io/badge/privacy-first-0d7d6c" alt="Privacy First">
  <img src="https://img.shields.io/badge/built%20with-React%20%2B%20TanStack-0d7d6c" alt="Built with React + TanStack">
  <a href="https://sackstack.app" target="_blank">
    <img src="https://img.shields.io/badge/live%20site-sackstack.app-0d7d6c" alt="Live site">
  </a>
</p>

<p align="center">
  <strong>Free, privacy-focused packing planner.</strong><br>
  Plan and balance the weight of every bag before a trip — no accounts, no tracking, your data stays in your browser.
</p>

<p align="center">
  <a href="https://sackstack.app" target="_blank">Live Demo</a> •
  <a href="https://github.com/DigitalLivestock/sackstack" target="_blank">GitHub</a> •
  <a href="https://sackstack.app/about" target="_blank">About</a> •
  <a href="https://sackstack.app/privacy" target="_blank">Privacy</a>
</p>

---

## What is Sack Stack?

Sack Stack helps travelers, hikers, and campers organize what goes into each bag, assign bags to carriers (people, dogs, cars, robots), and keep weight balanced across the whole trip.

It is a fully client-side web app that runs in your browser. Trips, bags, carriers, and items are stored only in `localStorage` — nothing is sent to any server, and no account is required.

## Features

- **Multiple bags & carriers** — create any number of bags and assign them to people, pets, vehicles, or anything that carries a load.
- **Weight tracking** — every item and bag has a weight; see running totals, warnings when bags get heavy, and balance across carriers.
- **Packing checklist** — mark items as packed and review progress with a dedicated checklist view.
- **Import & export** — back up your trips as JSON files and restore them anywhere.
- **Share trips** — generate a link that encodes your trip right in the URL fragment; the recipient's browser decodes it locally.
- **Privacy first** — no accounts, no login, no tracking. All data stays on your device.
- **PWA support** — works offline and can be installed on your phone or desktop.

## Tech Stack

- [React 19](https://react.dev)
- [TanStack Start](https://tanstack.com/start)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Bun](https://bun.sh)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (v1.1+ recommended)

### Install and run locally

```bash
# Clone the repository
git clone https://github.com/DigitalLivestock/sackstack.git
cd sackstack

# Install dependencies
bun install

# Start the development server
bun run dev
```

Open [http://localhost:8080](http://localhost:8080) to view the app.

### Build for production

```bash
bun run build
```

### Lint and format

```bash
bun run lint
bun run format
```

## Privacy & Transparency

Sack Stack is open-source software. The full source code is public, so anyone can verify exactly how the app handles data, what it sends to servers (nothing, for trip content), and what it tracks (also nothing).

- Read the [Privacy & Data page](https://sackstack.app/privacy)
- Read the [About page](https://sackstack.app/about)

## Deployment

The project is configured for TanStack Start with a static/production build. The live site is hosted at [sackstack.app](https://sackstack.app).

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request on [GitHub](https://github.com/DigitalLivestock/sackstack).

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Made with care in Sweden 🇸🇪
</p>
