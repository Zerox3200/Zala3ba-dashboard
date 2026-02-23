# Quiz Game Admin Panel

A modern, responsive admin panel for managing quiz game categories and questions, built with Vue 3, Vuetify 3, and Pinia. The UI is inspired by vibrant game interfaces with an orange/red color scheme and dynamic design elements.

## Features

### 🔐 Authentication
- User login and registration
- JWT token-based authentication
- Protected routes with navigation guards
- Automatic token management

### 📁 Category Management
- Create, read, update, and delete categories
- Upload media files (images/videos) for categories
- Search and filter categories
- Pagination support
- Responsive grid layout

### ❓ Question Management
- Add questions to specific categories
- Support for different difficulty levels (Easy, Medium, Hard)
- Upload media files for questions and answers
- Filter questions by difficulty
- Full CRUD operations with pagination

### 🎨 UI/UX Features
- Modern, game-inspired design
- Responsive layout for all devices
- Smooth animations and transitions
- Lightning bolt animations
- Gradient text effects
- Glassmorphism design elements

## Tech Stack

- **Frontend Framework**: Vue 3 (Composition API)
- **UI Framework**: Vuetify 3
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Icons**: Material Design Icons

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-game-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## API Configuration

The application is configured to work with the Laravel API at:
- **API Base URL**: `http://www.quiz-game.alatter.com`
- **Image Base URL**: `http://www.quiz-game.alatter.com`

### Required API Endpoints

#### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout

#### Categories
- `GET /api/categories` - List categories with pagination
- `POST /api/categories` - Create new category
- `GET /api/categories/{id}` - Get specific category
- `POST /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

#### Questions
- `GET /api/questions` - List questions with pagination
- `POST /api/questions` - Create new question
- `GET /api/questions/{id}` - Get specific question
- `POST /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
│   ├── Login.vue       # Authentication page
│   ├── Dashboard.vue   # Main dashboard
│   ├── Categories.vue  # Category management
│   └── CategoryQuestions.vue # Question management
├── stores/             # Pinia stores
│   ├── auth.js         # Authentication state
│   ├── categories.js   # Category management
│   └── questions.js    # Question management
├── router/             # Vue Router configuration
│   └── index.js
├── App.vue             # Root component
└── main.js             # Application entry point
```

## Usage

### Authentication
1. Navigate to the login page
2. Enter your email and password
3. Click "دخول" (Login) or register a new account
4. Upon successful authentication, you'll be redirected to the dashboard

### Managing Categories
1. From the dashboard, click "Go to Categories" or navigate to Categories
2. Use the "Add Category" button to create new categories
3. Fill in the category name, description, and optionally upload media
4. Use the action buttons to edit or delete categories
5. Click on a category to view and manage its questions

### Managing Questions
1. Navigate to a specific category
2. Click "Add Question" to create new questions
3. Fill in the question text, answer, and difficulty level
4. Optionally upload media files for the question or answer
5. Use the action buttons to edit or delete questions
6. Filter questions by difficulty using the dropdown

## Design Features

### Color Scheme
- **Primary**: Orange (#FF6B35)
- **Secondary**: Red (#D62828)
- **Accent**: Light Orange (#F7931E)
- **Background**: Gradient from orange to red

### Animations
- Lightning bolt icons with pulsing animation
- Hover effects on cards and buttons
- Smooth transitions for all interactive elements
- Gradient text effects

### Responsive Design
- Mobile-first approach
- Adaptive navigation drawer
- Responsive grid layouts
- Touch-friendly interface

## Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist` folder** to your web server

## Customization

### Theme Colors
Modify the color scheme in `src/main.js`:
```javascript
theme: {
  defaultTheme: 'light',
  themes: {
    light: {
      colors: {
        primary: '#FF6B35',    // Orange
        secondary: '#D62828',  // Red
        accent: '#F7931E',     // Light Orange
        // ... other colors
      }
    }
  }
}
```

### API Configuration
Update the API base URL in the store files:
```javascript
const API_BASE_URL = 'your-api-url'
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
"# quize_admin" 
