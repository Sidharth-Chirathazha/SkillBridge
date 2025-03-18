from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services import initialize_gemini
from .utils import retrieve_relevant_context
from .constants import WEBSITE_OVERVIEW, GENERAL_QUERIES_INFO
# Create your views here.


class ChatbotView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_message = request.data.get('message')
        
        # Get relevant context from your database
        context = retrieve_relevant_context(user_message)
        
        # Prepare prompt with all available information
        prompt = f"""
        You are an AI assistant for SkillBridge, an e-learning platform. 
        
        Here is an overview of the SkillBridge platform:
        {WEBSITE_OVERVIEW}
        
        Your capabilities and how you should interact with users:
        {GENERAL_QUERIES_INFO}
        
        Specific information related to the user's query:
        {context}
        
        User question: {user_message}
        
        Please respond based on the information provided. If you don't find relevant information, 
        respond with general advice based on the overview of SkillBridge and your capabilities.
        Keep responses friendly, informative, and concise as mentioned in your instructions.
        """
        
        # Get response from Gemini
        model = initialize_gemini()
        response = model.generate_content(prompt)
        
        return Response({"response": response.text})