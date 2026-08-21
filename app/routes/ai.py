from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services import ai_service

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])


@router.post(
    "/ask",
    response_model=schemas.AIAnswerResponse,
    summary="DeskFlow AI Support Assistant Endpoint",
    description="Answers operational questions, explains workflows, and provides live database ticket summaries.",
)
def ask_ai_assistant(
    payload: schemas.AIQuestionRequest,
    db: Session = Depends(get_db),
):
    result = ai_service.generate_ai_answer(question=payload.question, db=db)
    return schemas.AIAnswerResponse(
        answer=result["answer"],
        suggested_topics=result.get("suggested_topics", []),
    )
