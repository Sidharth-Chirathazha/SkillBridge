# Skillbridge - Learning Management System

## Overview
Skillbridge is a comprehensive Learning Management System (LMS) designed to connect students and tutors through an interactive and structured learning environment. It provides a platform for students to enroll in courses, engage with tutors through real-time chat and video calls, participate in communities, and track their learning progress. Tutors can create and manage courses, mentor students, and trade courses with other tutors. Admins oversee user roles, course approvals, and community management.

## Features
### Student Features
- Enroll in courses with **Stripe Payment Integration**
- Course completion tracking with module-based learning
- Watch videos and access study materials
- **Live sessions** with tutors via **real-time chat (Django Channels)** and **video calls (ZegoCloud)**
- Track **course progress** and **total learning time**
- Join communities and participate in **real-time group discussions (Django Channels)**
- Rate and review courses and tutors
- Comment and reply on course discussions (nested comments system)

### Tutor Features
- **Create, manage, and sell courses**
- Conduct **one-on-one sessions** via **real-time chat & video calls**
- Establish and manage **communities** for mentoring students (Django Channels real-time chat)
- Track **online users** in communities
- **Purchase courses** like students or **trade courses** with other tutors
- Improve personal skills by enrolling in courses

### Admin Features
- **Authorize tutors and courses**
- **Manage students, tutors, courses, and communities**
- Oversee platform activities and ensure compliance

### Other Key Features
- **Real-time Notifications** for chat, trade requests, and other interactions (Django Channels)
- **Dashboard** for students, tutors, and admins to monitor their activities and progress

## Tech Stack
### Frontend
- **Framework**: React.js
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS with components from:
  - Headless UI
  - Material UI
  - Tailwind
- **UI/UX Libraries**:
  - **Icons**: Font Awesome, Lucide React, React Icons
  - **Animations**: Framer Motion
  - **Charts**: Recharts, Chart.js with react-chartjs-2
  - **Forms**: React Hook Form with Joi (validation)
  - **Date Handling**: date-fns
  - **Notifications**: React Hot Toast, SweetAlert2

### Backend
- **Backend Framework**: Django
- **API Framework**: Django REST Framework (DRF)
- **Real-time Communication**: Django Channels
- **Database**: PostgreSQL
- **Caching**: Redis
- **Task Management**: Celery & Celery Beat
- **Media Storage**: Cloudinary
- **Authentication**: JWT & Google OAuth
- **Payment Integration**: Stripe
- **Video Chat**: ZegoCloud

## Installation & Setup
### Backend
1. Clone the repository:
   ```sh
   git clone https://github.com/Sidharth-Chirathazha/SkillBridge.git
   cd server
   ```
2. Create a virtual environment and activate it:
   ```sh
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Apply database migrations:
   ```sh
   python manage.py migrate
   ```
5. Start the Django development server:
   ```sh
   cd skillbridge
   python manage.py runserver
   ```

### Frontend
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

