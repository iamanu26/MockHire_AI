# voice_routes.py is no longer needed.
# The /interview/voice/tech route has been moved into main.py
# so that all routes share the same InterviewAgent instance.
#
# You can safely delete this file.
# Also remove this line from main.py if it still exists:
#   from voice_routes import router as voice_router
#   app.include_router(voice_router)