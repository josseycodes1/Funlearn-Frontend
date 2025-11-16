# Funlearn - Learn with Fun 🎓✨

**Frontend**: https://funlearn-frontend.vercel.app/  
**Backend**: https://funlearn-backend-f3cg.onrender.com  
**Frontend Repository**: https://github.com/josseycodes1/Funlearn-Frontend.git  
**Backend Repository**: https://github.com/Kingsley-codes/funlearn-backend.git  
**API Documentation**: https://documenter.getpostman.com/view/41722320/2sB3WwoweG  

## 🏆 Hackathon Submission - Automate Learning & Make Learning Fun Tracks

Funlearn is a revolutionary gamified learning platform that combines AI-powered automation with engaging gaming elements to transform traditional education into an exciting, interactive experience. We're tackling both main tracks by automating study processes while making learning genuinely fun through gamification!

## 🚀 What Makes Funlearn Unique?

### 🤖 AI-Powered Learning Assistant "Lumi"
- **Smart Document Analysis**: Upload PDF textbooks and study materials
- **Instant Summarization**: Get concise summaries and key point extraction
- **Personalized Explanations**: Ask questions about your documents and get tailored responses
- **Content Adaptation**: Automatically adjusts explanations based on your learning level

### 🎮 Gamified Learning Ecosystem
- **Progressive Quiz System**: Two difficulty levels with escalating point values
- **Real-time Leaderboards**: Compete with peers and track your ranking
- **Achievement System**: Unlock badges and level up as you learn
- **Collaborative Challenges**: Study groups with shared goals and rewards

## 🎯 Key Features

### 📚 AI-Powered Study Tools
- **Document Upload & Analysis**: Upload PDF textbooks and get instant AI-powered insights
- **Smart Summarization**: Lumi extracts key concepts and creates study-friendly summaries
- **Interactive Q&A**: Ask follow-up questions about your uploaded materials
- **Resource Generation**: Get additional learning resources based on your study content

### 🎯 Gamified Quiz System
- **Adaptive Difficulty**: Easy (1 point), Hard (2 points) question system
- **Topic-Based Generation**: Input any subject and get instant quiz questions
- **Progress Tracking**: Monitor your improvement across different topics
- **Score Analytics**: Detailed breakdown of your performance

### 👥 Collaborative Learning
- **Real-time Chat Rooms**: Create or join study groups for collaborative learning
- **File Sharing**: Share study materials directly in chat rooms
- **Group Challenges**: Compete with study groups on leaderboards
- **Peer Learning**: Discuss concepts and solve problems together

### 📊 Progress & Analytics
- **Personal Dashboard**: Overview of your learning journey and achievements
- **Rank System**: 20 unique ranks from "Brain Sprout 🌱" to "Sync Sage 🔱"
- **Performance Insights**: Track your strengths and areas for improvement
- **Learning Analytics**: Visual progress tracking and milestone celebrations

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with App Router for optimal performance
- **TypeScript** for type-safe development
- **Tailwind CSS** for beautiful, responsive design
- **React Context** for state management
- **Axios** for API communication
- **WebSocket** for real-time features

### Backend
- **Express.js** with robust API architecture
- **MongoDB** for flexible data storage
- **JWT Authentication** for secure access
- **Socket.io** for real-time communication
- **AI Integration** for intelligent content processing
- **File Upload Handling** for document processing

## 🎨 Design System

### Color Palette
```css
/* Modern Lilac Theme */
--color-funlearn1: #F5F3FF;  /* Light background */
--color-funlearn2: #EDE9FE;  /* Card backgrounds */
--color-funlearn6: #8B5CF6;  /* Primary actions */
--color-funlearn8: #6D28D9;  /* Highlights & accents */
```

### Typography
- **Primary Font**: Outfit - Modern, readable, and friendly
- **Perfect Balance**: Professional yet approachable for students

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/josseycodes1/Funlearn-Frontend.git
   cd Funlearn-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_BASE_URL=https://funlearn-backend-f3cg.onrender.com
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

1. **Clone the backend repository**
   ```bash
   git clone https://github.com/Kingsley-codes/funlearn-backend.git
   cd funlearn-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file with required variables (refer to backend repository)

4. **Start the server**
   ```bash
   npm start
   ```

###  User Experience
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Modern UI**: Clean, intuitive interface with lilac and white theme
- **Fast Performance**: Built with Next.js 14 for optimal speed
- **Type Safety**: Full TypeScript support

##  Pages & Routes

### Landing Page Sections
- **Navbar**: Responsive navigation with mobile menu
- **Hero**: Compelling headline with call-to-action
- **Features**: Three main feature highlights
- **How It Works**: Step-by-step guide
- **Testimonials**: Social proof from students
- **CTA**: Final conversion section
- **Footer**: Site links and information

### Authentication (Upcoming)
- `/signup` - User registration
- `/login` - User login

### Dashboard (Upcoming)
- `/dashboard` - Main user dashboard
- `/quiz` - Gamified quizzes
- `/chat` - Collaborative chat rooms
- `/profile` - User profile management


### Development Guidelines
1. Follow TypeScript best practices
2. Ensure responsive design for all components
3. Maintain consistent color scheme and typography
4. Write clean, commented code


## 🎮 How to Use Funlearn

### 1. 🏠 Getting Started
- Sign up and create your student profile
- Set your academic level and interests
- Explore the intuitive dashboard

### 2. 📖 AI-Powered Studying with Lumi
- **Upload Documents**: Click "Upload PDF" in the chatbot interface
- **Get Instant Analysis**: Lumi automatically summarizes key points
- **Ask Follow-up Questions**: "Explain this concept" or "Give me examples"
- **Request Resources**: "Find me additional materials about this topic"

### 3. 🎯 Taking Quizzes
- **Generate New Quiz**: Enter any topic to get instant questions
- **Join Existing Quiz**: Use invite tokens from friends
- **Progressive Difficulty**: Start with easy questions, unlock hard challenges
- **Earn Points**: Correct answers earn points for leaderboard ranking

### 4. 👥 Collaborative Learning
- **Create Study Groups**: Start chat rooms for specific subjects
- **Invite Peers**: Share invite tokens with classmates
- **Share Resources**: Upload files and discuss in real-time
- **Group Challenges**: Compete together on the leaderboard

### 5. 📊 Tracking Progress
- **View Leaderboard**: See how you rank against peers
- **Check Achievements**: Unlock new ranks and badges
- **Monitor Growth**: Track improvement across different subjects
- **Set Goals**: Use analytics to identify focus areas

## 🏗️ Project Structure

```
Funlearn-Frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard routes
│   │   ├── chatbot/      # AI assistant interface
│   │   ├── quizpage/     # Quiz generation and taking
│   │   ├── chatroom/     # Collaborative chat rooms
│   │   ├── leaderboard/  # Rankings and achievements
│   │   └── profile/      # User profile management
│   ├── layout.tsx        # Root layout with providers
│   └── globals.css       # Global styles and design system
├── components/           # Reusable React components
│   ├── Dashboard/        # Dashboard-specific components
│   └── UI/              # Generic UI components
├── contexts/            # React context for state management
└── public/              # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint for code quality

# Testing
npm test                 # Run test suite
```

## 🎯 Hackathon Alignment

### 🏆 Automate Learning Track
- **AI Document Processing**: Automates textbook analysis and summarization
- **Smart Quiz Generation**: Automatically creates questions from any topic
- **Personalized Learning Paths**: AI adapts to individual student needs
- **Automated Progress Tracking**: Continuous assessment without manual input

### 🎮 Make Learning Fun Track
- **Gamified Progression**: Level-up system with 20 unique ranks
- **Competitive Elements**: Real-time leaderboards and peer competition
- **Achievement System**: Badges and rewards for learning milestones
- **Social Learning**: Collaborative chat rooms and group challenges
- **Engaging UI**: Beautiful, intuitive interface that feels like a game

## 🌟 Unique Value Propositions

### For Students:
- **Time Efficiency**: AI summarizes hours of reading in minutes
- **Better Understanding**: Interactive Q&A with uploaded materials
- **Motivation**: Game-like progression keeps learning engaging
- **Collaboration**: Learn with friends and classmates
- **Personalization**: Adapts to individual learning styles

### For Educators:
- **Automated Assessment**: Generate quizzes instantly for any topic
- **Progress Monitoring**: Track student engagement and understanding
- **Collaborative Tools**: Facilitate group learning and discussions
- **Resource Generation**: AI creates additional learning materials

## 🚀 Future Enhancements

- [ ] Mobile app for on-the-go learning
- [ ] Voice interactions with Lumi AI
- [ ] Advanced analytics for learning patterns
- [ ] Integration with popular LMS platforms
- [ ] Multi-language support
- [ ] Virtual study rooms with video capabilities

##  Upcoming Features

- [ ] User authentication system
- [ ] Dashboard with sidebar navigation
- [ ] AI-powered content analysis
- [ ] Gamified quiz system with 3 difficulty levels
- [ ] Real-time chat rooms
- [ ] Progress tracking and analytics
- [ ] Leaderboard and ranking system


## 👥 Funlearn Team

Built with passion by Josephine and KIngsley, who are  developers who believe learning should be exciting, accessible, and effective for every student. 

**Funlearn** - Transforming education through AI automation and gamification, making learning an adventure every student wants to embark on! 🚀🎓

*Ready to revolutionize your learning experience? Visit [https://funlearn-frontend.vercel.app](https://funlearn-frontend.vercel.app) to get started!*