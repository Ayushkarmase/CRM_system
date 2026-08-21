import re
from sqlalchemy.orm import Session
from app.models import Ticket


def generate_ticket_id(db: Session) -> str:
    """
    Generates a unique human-readable ticket ID in format TKT-001, TKT-002, etc.
    Finds the highest existing numeric suffix and increments it.
    """
    tickets = db.query(Ticket.ticket_id).all()
    max_num = 0

    for (t_id,) in tickets:
        match = re.search(r"TKT-(\d+)", t_id)
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    next_num = max_num + 1
    return f"TKT-{next_num:03d}"
