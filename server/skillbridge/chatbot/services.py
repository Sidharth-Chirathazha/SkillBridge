import google.generativeai as genai
from django.conf import settings

def initialize_gemini():
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel('gemini-1.5-flash')