from .data_extraction import extract_courses_data, extract_tutors_data

def retrieve_relevant_context(query):
    """Retrieves relevant course or tutor information based on the user's query using a keyword-based retrieval system."""
    context_parts = []
    query_lower = query.lower()
    
    courses = extract_courses_data()
    tutors = extract_tutors_data()
    
    # Check for course-related queries
    course_keywords = ['course', 'courses', 'class', 'learn', 'study', 'subject', 'lesson', 'training']
    if any(keyword in query_lower for keyword in course_keywords):
        relevant_courses = []
        for course in courses:
            course_title_lower = course['title'].lower()
            if any(word in course_title_lower for word in query_lower.split()):
                relevant_courses.append(f"Course: {course['title']} - {course['description']} - Rating: {course['rating']} - Tutor: {course['tutor']} - Price: {course['price']}")
        
        if relevant_courses:
            context_parts.append("Relevant courses based on your query:")
            context_parts.extend(relevant_courses)
    
    # Check for tutor-related queries
    tutor_keywords = ['tutor','tutors','teacher', 'instructor', 'mentor', 'professor']
    if any(keyword in query_lower for keyword in tutor_keywords):
        relevant_tutors = []
        for tutor in tutors:
            tutor_name_lower = tutor['name'].lower()
            if any(word in tutor_name_lower for word in query_lower.split()):
                relevant_tutors.append(f"Tutor: {tutor['name']} - {tutor['bio']} - Specialization: {tutor['current_job']} - Rating:{tutor['rating']}")
        
        if relevant_tutors:
            context_parts.append("Relevant tutors based on your query:")
            context_parts.extend(relevant_tutors)
    
    
    if not context_parts:
        context_parts.append("I couldn't find specific information related to your query in our database, but I can help based on general knowledge about SkillBridge.")
    
    return "\n".join(context_parts)

