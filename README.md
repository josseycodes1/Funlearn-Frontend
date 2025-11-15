
# Funlearn - Learn with Fun

A modern, gamified learning platform built with Next.js, ExpressJS, and Tailwind CSS that makes studying enjoyable for students through interactive features and AI-powered tools.

##  Features

###  Core Features
- **AI-Powered Analysis**: Upload study materials and get instant summaries, key points, and explanations
- **Gamified Quizzes**: Three difficulty levels with points, badges, and leaderboards
- **Collaborative Chat Rooms**: Real-time chat rooms for group study sessions
- **Progress Tracking**: Monitor your learning journey with detailed analytics

###  User Experience
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Modern UI**: Clean, intuitive interface with lilac and white theme
- **Fast Performance**: Built with Next.js 14 for optimal speed
- **Type Safety**: Full TypeScript support

##  Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful notifications

### Backend
- **ExpressJS** - Web framework for Node.js
- **WebSocket** - Real-time chat functionality
- **AI Integration** - For content analysis and summarization

## Design System

### Color Palette
```css
/* Primary Colors */
--color-funlearn1: #F5F3FF;  /* Lightest lilac */
--color-funlearn2: #EDE9FE;  /* Very light lilac */
--color-funlearn3: #DDD6FE;  /* Light lilac */
--color-funlearn4: #C4B5FD;  /* Soft lilac */
--color-funlearn5: #A78BFA;  /* Medium lilac */
--color-funlearn6: #8B5CF6;  /* Primary lilac */
--color-funlearn7: #7C3AED;  /* Dark lilac */
--color-funlearn8: #6D28D9;  /* Darker lilac */
--color-funlearn9: #5B21B6;  /* Darkest lilac */
```

### Typography
- **Primary Font**: Outfit (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

##  Project Structure

```
funlearn/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── landing/          # Landing page components
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── Features.tsx
│       ├── HowItWorks.tsx
│       ├── Testimonials.tsx
│       ├── CTA.tsx
│       └── Footer.tsx
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd funlearn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

##  Pages & Routes

### Landing Pages
- `/` - Homepage with hero section and features
- `#features` - Features showcase
- `#how-it-works` - How it works section
- `#testimonials` - Student testimonials

### Authentication (Upcoming)
- `/signup` - User registration
- `/login` - User login

### Dashboard (Upcoming)
- `/dashboard` - Main user dashboard
- `/quiz` - Gamified quizzes
- `/chat` - Collaborative chat rooms
- `/profile` - User profile management

##  Key Components

### Landing Page Sections
- **Navbar**: Responsive navigation with mobile menu
- **Hero**: Compelling headline with call-to-action
- **Features**: Three main feature highlights
- **How It Works**: Step-by-step guide
- **Testimonials**: Social proof from students
- **CTA**: Final conversion section
- **Footer**: Site links and information

##  Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with CSS-based configuration in `globals.css`.

### Font Setup
Google Fonts (Outfit) are configured in `layout.tsx` for optimal performance.

##  Upcoming Features

- [ ] User authentication system
- [ ] Dashboard with sidebar navigation
- [ ] AI-powered content analysis
- [ ] Gamified quiz system with 3 difficulty levels
- [ ] Real-time chat rooms
- [ ] Progress tracking and analytics
- [ ] Leaderboard and ranking system

##  Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Guidelines
1. Follow TypeScript best practices
2. Ensure responsive design for all components
3. Maintain consistent color scheme and typography
4. Write clean, commented code

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the Funlearn team for students worldwide.

---

**Funlearn** - Making learning enjoyable, one student at a time! 
```
