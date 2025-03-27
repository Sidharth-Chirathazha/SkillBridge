# Skillbridge - Learning Management System

## Overview
Skillbridge is a comprehensive Learning Management System (LMS) designed to connect students and tutors through an interactive and structured learning environment. It provides a platform for students to enroll in courses, engage with tutors through real-time chat and video calls, participate in communities, share blog posts, and track their learning progress. Tutors can create and manage courses, mentor students, trade courses with other tutors, and interact through an AI-powered chatbot.

## Features
- **AI Chatbot** using Gemini API for personalized learning support
- **Blog Posts** for students and tutors to share informative content
- **Real-time Communication** through chats and video calls using ZegoCloud
- **Course Management** for tutors to create, sell, and trade courses
- **Stripe Payment Integration** for secure transactions
- **Community Engagement** with real-time group discussions using Django Channels
- **Dashboard** to track progress, monitor activities, and access analytics

## Tech Stack
### Frontend
- **Framework**: React.js
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with Material UI and Headless UI
- **UI/UX Libraries**: Font Awesome, Lucide React, Framer Motion
- **Charts**: Recharts, Chart.js with react-chartjs-2
- **Forms**: React Hook Form with Joi
- **Notifications**: React Hot Toast, SweetAlert2

### Backend
- **Framework**: Django
- **API**: Django REST Framework (DRF)
- **Real-time Communication**: Django Channels
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Management**: Celery & Celery Beat
- **Media Storage**: Cloudinary
- **Authentication**: JWT & Google OAuth
- **Payment Integration**: Stripe
- **Video Chat**: ZegoCloud
- **AI Integration**: Gemini API

## Installation & Setup

### Prerequisites
- Docker & Docker Compose installed
- Node.js and npm installed
- Python (if running locally without Docker)

### Backend with Docker
1. Clone the repository:
    ```sh
    git clone https://github.com/Sidharth-Chirathazha/SkillBridge.git
    cd server
    ```

2. Create a `.env` file in the root directory and configure your environment variables as follows:
    ```env
    DJANGO_SECRET_KEY=your-secret-key
    DEBUG=False
    DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1 web your-domain.com
    DB_NAME=your-db-name
    DB_USER=your-db-user
    DB_PASSWORD=your-db-password
    DB_HOST=db
    DB_PORT=5432
    DB_ENGINE=django.db.backends.postgresql
    EMAIL_HOST_USER=your-email
    EMAIL_HOST_PASSWORD=your-email-password
    CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
    CLOUDINARY_API_KEY=your-cloudinary-api-key
    CLOUDINARY_API_SECRET=your-cloudinary-api-secret
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
    STRIPE_SECRET_KEY=your-stripe-secret-key
    STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
    ZEGO_APP_ID=your-zegocloud-app-id
    ZEGO_SERVER_SECRET=your-zegocloud-server-secret
    GEMINI_API_KEY=your-gemini-api-key
    ```

3. Build and run the Docker containers:
    ```sh
    docker-compose build
    docker-compose up
    ```

4. Apply migrations and create a superuser:
    ```sh
    docker-compose exec web python manage.py migrate
    docker-compose exec web python manage.py createsuperuser
    ```

5. Access the app at `http://localhost:8000`

### Frontend Setup
1. Navigate to the frontend directory:
    ```sh
    cd ../client
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm run dev
    ```

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Added new feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## License
This project is licensed under the MIT License.

## Contact
For any inquiries or collaborations, reach out via email: **sidharthchirathazha@gmail.com**



