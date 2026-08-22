class AIServiceException(Exception):
    """Base exception for AI-Recruit360 Python service errors."""
    def __init__(self, message: str, code: str = "AI_SERVICE_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class AIProviderError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="AI_PROVIDER_ERROR")

class AIValidationError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="AI_VALIDATION_ERROR")

class DocumentExtractionError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="DOCUMENT_EXTRACTION_ERROR")

class ScreeningError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="SCREENING_ERROR")

class AssessmentGenerationError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="ASSESSMENT_GENERATION_ERROR")

class InterviewError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="INTERVIEW_ERROR")

class EvaluationError(AIServiceException):
    def __init__(self, message: str):
        super().__init__(message, code="EVALUATION_ERROR")
