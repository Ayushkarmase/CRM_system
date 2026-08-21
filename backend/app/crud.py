from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models import Ticket, Note
from app.schemas import TicketCreate, TicketUpdate
from app.services.ticket_service import generate_ticket_id


def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
    new_id = generate_ticket_id(db)
    now = datetime.utcnow()
    db_ticket = Ticket(
        ticket_id=new_id,
        customer_name=ticket_in.customer_name,
        customer_email=ticket_in.customer_email,
        subject=ticket_in.subject,
        description=ticket_in.description,
        status="Open",
        priority=ticket_in.priority or "Medium",
        created_at=now,
        updated_at=now,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def get_tickets(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
) -> List[Ticket]:
    query = db.query(Ticket)

    if status and status.strip().lower() != "all":
        # Case insensitive status match
        query = query.filter(func.lower(Ticket.status) == status.strip().lower())

    if priority and priority.strip().lower() != "all":
        # Case insensitive priority match
        query = query.filter(func.lower(Ticket.priority) == priority.strip().lower())

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Ticket.ticket_id).like(term),
                func.lower(Ticket.customer_name).like(term),
                func.lower(Ticket.customer_email).like(term),
                func.lower(Ticket.subject).like(term),
                func.lower(Ticket.description).like(term),
            )
        )

    return query.order_by(Ticket.id.desc()).offset(skip).limit(limit).all()


def get_ticket_by_ticket_id(db: Session, ticket_id: str) -> Optional[Ticket]:
    return db.query(Ticket).filter(func.lower(Ticket.ticket_id) == ticket_id.strip().lower()).first()


def update_ticket(db: Session, db_ticket: Ticket, ticket_update: TicketUpdate) -> Ticket:
    now = datetime.utcnow()
    updated = False

    if ticket_update.status:
        db_ticket.status = ticket_update.status
        updated = True

    if ticket_update.priority:
        db_ticket.priority = ticket_update.priority
        updated = True

    if updated:
        db_ticket.updated_at = now

    if ticket_update.notes and ticket_update.notes.strip():
        note = Note(
            ticket_id=db_ticket.id,
            note_text=ticket_update.notes.strip(),
            created_at=now,
        )
        db.add(note)
        db_ticket.updated_at = now

    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def add_note_to_ticket(db: Session, db_ticket: Ticket, note_text: str) -> Note:
    now = datetime.utcnow()
    note = Note(
        ticket_id=db_ticket.id,
        note_text=note_text.strip(),
        created_at=now,
    )
    db.add(note)
    db_ticket.updated_at = now
    db.commit()
    db.refresh(note)
    return note


def get_ticket_stats(db: Session) -> dict:
    total = db.query(Ticket).count()

    # Case insensitive status counts
    open_count = db.query(Ticket).filter(func.lower(Ticket.status) == "open").count()
    in_progress_count = db.query(Ticket).filter(func.lower(Ticket.status) == "in progress").count()
    closed_count = db.query(Ticket).filter(func.lower(Ticket.status) == "closed").count()

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress_count,
        "closed": closed_count,
    }
