from courses.models import Course, Category
from tutor.models import TutorProfile


"""This function fetches the course data from database and returns it for creating promt for Gemini API with course information"""
def extract_courses_data():
    courses = Course.objects.all()
    courses_data = []
    
    for course in courses:
        course_info = {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "tutor": course.tutor.user.get_full_name(),
            "category": course.category.name,
            "price": str(course.price),
            "rating": course.rating,
            "difficulty":course.skill_level,
            "total_chapters":course.modules.count()
            # Add other relevant fields
        }
        courses_data.append(course_info)
    
    return courses_data

"""This function fetches the tutors data from the database and returns it for creating promt for Gemini API with tutor information """
def extract_tutors_data():
    tutors = TutorProfile.objects.all()
    tutors_data = []

    for tutor in tutors:
        tutor_info = {
            "name":tutor.user.get_full_name(),
            "rating":tutor.rating,
            "current_job":tutor.cur_job_role,
            "bio":tutor.user.bio
        }
        tutors_data.append(tutor_info)

    return tutors_data