# TCP/IP Protocol Visualization Project

A modern, interactive web application for visualizing and understanding TCP/IP protocol concepts through finite state machines, animations, and demonstrations.

## 📋 Project Overview

This project showcases TCP/IP protocol implementations using an interactive web interface built with **Next.js 14**, **React**, and **TypeScript**. It includes 5 versions of protocol implementations (v0, v5, v10, v15, v24) with increasing complexity, complete with visual FSM diagrams, state transitions, and step-by-step protocol walkthroughs.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:3000`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Run production server:**
   ```bash
   npm run start
   ```

---

## 📁 Project Structure

```
tcp_ip_protocol/
├── src/                          # Source code
│   ├── app/                      # Next.js app router pages
│   │   ├── api/                  # API routes
│   │   ├── demonstration/        # Demonstration page
│   │   ├── finite-state-machine/ # FSM visualization page
│   │   ├── grad-presentation/    # Presentation page
│   │   ├── intro/                # Introduction page
│   │   ├── simulator/            # Protocol simulator page
│   │   ├── layout.tsx            # Root layout component
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   │
│   └── components/               # Reusable React components
│       ├── FiniteStateMachineVisualizer.tsx  # Main FSM visualization
│       ├── FiveVersionsVisualizer.tsx        # 5-version demonstrations
│       ├── AckNakVisualizer.tsx              # ACK/NAK protocol demo
│       ├── ByteTransferVisualizer.tsx        # Byte transfer animation
│       ├── OneBitVisualizer.tsx              # Single bit transfer demo
│       ├── SequenceNumberVisualizer.tsx      # Sequence numbering demo
│       ├── ProtocolVisualizer.tsx            # General protocol visualization
│       ├── DocumentationLayout.tsx           # Documentation wrapper
│       └── Navigation.tsx                    # Navigation component
│
├── my_final_grad_project/        # C source files for protocol implementations
│   ├── sender_0.c - sender_24.c  # Sender implementations for versions 0-24
│   └── receiver_0.c - receiver_24.c  # Receiver implementations for versions 0-24
│
├── 5_versions_demonstration/     # Demonstration C files
│   ├── sender_*.c                # Sender code for versions 0, 5, 10, 15, 24
│   └── receiver_*.c              # Receiver code for versions 0, 5, 10, 15, 24
│
├── pratik_report/                # Thesis/Report documentation
│   ├── thesis.tex                # Main thesis file
│   ├── 0-prematter/              # Pre-matter sections (dedication, abstract)
│   ├── 1-frontmatter/            # Front matter (acknowledgements, glossary)
│   ├── 2-mainmatter/             # Main content chapters and appendices
│   ├── 3-backmatter/             # Back matter (committee, CV)
│   ├── images/                   # Thesis images and figures
│   └── references.bib            # Bibliography file
│
├── finite_state_machine/         # Additional FSM resources
│
├── package.json                  # Node dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── next.config.js                # Next.js configuration (if exists)
├── .eslintrc.json                # ESLint configuration
├── next-env.d.ts                 # Next.js environment types
└── README.md                     # This file
```

---

## 📚 Key Files & Components

### Pages
- **`/` (Home)** - Main landing page with project overview
- **`/intro`** - Introduction to TCP/IP concepts
- **`/finite-state-machine`** - Interactive FSM visualizer with 5 protocol versions
- **`/demonstration`** - Step-by-step protocol demonstrations
- **`/grad-presentation`** - Presentation slides
- **`/simulator`** - Live protocol simulator

### Components
- **FiniteStateMachineVisualizer** - Main component showing state transitions with animated flows
- **FiveVersionsVisualizer** - Displays all 5 protocol versions side-by-side
- **AckNakVisualizer** - Visualizes ACK/NAK acknowledgment protocol
- **ByteTransferVisualizer** - Shows byte-level data transfer animation
- **SequenceNumberVisualizer** - Demonstrates sequence number management

### Protocol Versions
1. **v0** - Raw UDP bit transfer (simplest)
2. **v5** - Parity framing with ACK/NAK
3. **v10** - Selective repeat with window-4
4. **v15** - Enhanced error handling
5. **v24** - Full TCP-like implementation (most complex)

---

## 🛠️ Available Commands

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm run start

# Run ESLint to check code quality
npm run lint
```

---

## 🎨 Technologies Used

- **Next.js 14.2.3** - React framework with app router
- **React 18.3.1** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 12.38.0** - Animation library
- **Lucide React 1.7.0** - Icon library
- **Puppeteer 24.40.0** - Browser automation (for testing)

---

## 🎯 Features

✅ **Interactive FSM Visualizer** - Real-time state machine visualization with smooth animations
✅ **5 Protocol Versions** - Compare and understand protocol evolution
✅ **Step-by-Step Walkthroughs** - Follow protocol execution step by step
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Production Ready** - Optimized build with static generation
✅ **Source Code Reference** - C implementations of all protocols included

---

## 📖 Understanding the Visualizations

### Finite State Machine View
The FSM visualizer shows:
- **State boxes** - Represent protocol states
- **Transition arrows** - Show state transitions with labels
- **Timeline** - Displays step-by-step protocol flow
- **Sender/Receiver** - Dual-rail display for bidirectional communication

### Interactive Controls
- **Play** - Auto-play through protocol steps (2.2 second intervals)
- **Previous/Next** - Manual step navigation
- **Reset** - Return to initial state
- **Version Selector** - Switch between 5 protocol implementations

---

## 🏗️ How to Extend

### Add a New Protocol Version
1. Create sender and receiver C files in `my_final_grad_project/`
2. Add version definition to `VERSIONS` array in `FiniteStateMachineVisualizer.tsx`
3. Include states, loops, and steps for the new version

### Customize Visualizations
- Edit components in `src/components/`
- Adjust SVG rendering for FSM diagrams
- Modify animation timing via `curveDepth` and interval values

### Add New Pages
1. Create a new folder in `src/app/[page-name]/`
2. Add `page.tsx` with your React component
3. Update Navigation.tsx if needed

---

## 📝 Notes

- The project uses TypeScript for type safety
- All styles are defined using Tailwind CSS utility classes
- SVG-based diagrams for crisp, scalable graphics
- Static site generation for optimal performance
- Components are modular and reusable

---

## 👤 Author

Pratik Patil - Final graduation project on TCP/IP protocol visualization

---

## 📄 License

This project is private and part of academic work.

---

## 🔗 Links

- **Development**: `npm run dev` → http://localhost:3000
- **Production**: `npm run start` → http://localhost:3000
- **Documentation**: See `/pratik_report/` for detailed thesis

---

## ✨ Getting Started Checklist

- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Open browser at http://localhost:3000
- [ ] Navigate to "Finite State Machine" page
- [ ] Select a protocol version (v0, v5, v10, v15, v24)
- [ ] Click "Play" to see the animation
- [ ] Read the thesis in `pratik_report/` for detailed explanations

---

**Happy exploring! 🚀**
