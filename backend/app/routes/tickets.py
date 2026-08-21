from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud, schemas

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.post(
    "",
    response_model=schemas.TicketDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new customer support ticket",
    description="Captures customer support requests and generates a unique human-readable Ticket ID (e.g. TKT-001).",
)
def create_ticket(
    ticket_in: schemas.TicketCreate,
    db: Session = Depends(get_db),
):
    try:
        new_ticket = crud.create_ticket(db=db, ticket_in=ticket_in)
        return new_ticket
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}",
        )


@router.get(
    "",
    response_model=List[schemas.TicketResponse],
    summary="List and search tickets",
    description="Retrieve all tickets with optional filtering by status, priority, and text search across ID, customer, email, subject, and description.",
)
def get_tickets(
    status: Optional[str] = Query(None, description="Filter by status: Open, In Progress, Closed"),
    priority: Optional[str] = Query(None, description="Filter by priority: Low, Medium, High, Urgent"),
    search: Optional[str] = Query(None, description="Search term across tickets"),
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    tickets = crud.get_tickets(
        db=db,
        status=status,
        search=search,
        priority=priority,
        skip=skip,
        limit=limit,
    )
    return tickets


@router.get(
    "/stats",
    response_model=schemas.StatsResponse,
    summary="Get support queue statistics",
    description="Returns aggregate ticket counts (Total, Open, In Progress, Closed) calculated from database records.",
)
def get_ticket_stats(db: Session = Depends(get_db)):
    return crud.get_ticket_stats(db=db)


@router.get(
    "/{ticket_id}",
    response_model=schemas.TicketDetailResponse,
    summary="Get individual ticket details",
    description="Retrieve complete ticket information including internal notes history.",
)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    ticket = crud.get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found.",
        )
    return ticket


@router.put(
    "/{ticket_id}",
    response_model=schemas.TicketUpdateResponse,
    summary="Update ticket status, priority, or add a note",
    description="Update workflow status (Open, In Progress, Closed), priority, and optionally attach an internal note.",
)
def update_ticket(
    ticket_id: str,
    ticket_update: schemas.TicketUpdate,
    db: Session = Depends(get_db),
):
    ticket = crud.get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found.",
        )

    updated_ticket = crud.update_ticket(db=db, db_ticket=ticket, ticket_update=ticket_update)
    return schemas.TicketUpdateResponse(
        success=True,
        ticket_id=updated_ticket.ticket_id,
        status=updated_ticket.status,
        priority=updated_ticket.priority,
        updated_at=updated_ticket.updated_at,
    )


@router.post(
    "/{ticket_id}/notes",
    response_model=schemas.NoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add internal note to ticket",
    description="Attach a timestamped internal team note to a customer ticket.",
)
def add_note(
    ticket_id: str,
    note_in: schemas.NoteCreate,
    db: Session = Depends(get_db),
):
    ticket = crud.get_ticket_by_ticket_id(db=db, ticket_id=ticket_id)
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{ticket_id}' not found.",
        )

    note = crud.add_note_to_ticket(db=db, db_ticket=ticket, note_text=note_in.note_text)
    return note
