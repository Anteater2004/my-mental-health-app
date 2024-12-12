# Mental Health Backend

This is the backend codebase for a mental health app focusing on combating rumination, setting goals, and expressing gratitude.

## Features
- User authentication
- Journaling
- Goal tracking
- Gratitude entries
- AI integration for sentiment analysis (in progress)

## Tech Stack
- Django
- PostgreSQL
- Supabase

## How to Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mental_health_backend.git
   python3 -m venv venv
   Activate the virtual environment:
      On macOS/Linux:
         source venv/bin/activate
      On Windows:
         venv\Scripts\activate
   pip install -r requirements.txt
   cd mental_health_backend
   python manage.py migrate (DO NOT DO THIS!!!)
   python manage.py runserver
   http://127.0.0.1:8000
