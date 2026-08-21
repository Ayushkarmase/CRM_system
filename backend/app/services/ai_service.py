import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Ticket, Note


def generate_ai_answer(question: str, db: Session) -> dict:
    """
    DeskFlow Backend Operational AI Engine.
    Processes user questions, queries live database state when needed (e.g. ticket counts,
    ticket ID lookup, priority queries), and returns helpful markdown answers.
    """
    q_lower = question.strip().lower()

    # 1. Check if the query references a specific ticket ID (e.g. TKT-001, TKT-005)
    match_ticket = re.search(r"tkt-\d+", q_lower)
    if match_ticket:
        target_id = match_ticket.group(0).upper()
        ticket = db.query(Ticket).filter(func.lower(Ticket.ticket_id) == target_id.lower()).first()
        if ticket:
            notes_count = len(ticket.notes)
            return {
                "answer": (
                    f"Here are the live details for **{ticket.ticket_id}**:\n\n"
                    f"• **Customer**: {ticket.customer_name} ({ticket.customer_email})\n"
                    f"• **Subject**: {ticket.subject}\n"
                    f"• **Status**: **{ticket.status}**\n"
                    f"• **Priority**: **{ticket.priority}**\n"
                    f"• **Notes Attached**: {notes_count} internal notes\n"
                    f"• **Description**: {ticket.description}\n\n"
                    f"Tip: Open /tickets/{ticket.ticket_id} to update status or add internal notes."
                ),
                "suggested_topics": ["Managing Ticket Statuses", "Internal Team Notes"],
            }
        else:
            return {
                "answer": f"I checked the database, but ticket **{target_id}** was not found. Please verify the Ticket ID.",
                "suggested_topics": ["Search & Filter Operations", "How DeskFlow Works"],
            }

    # 2. Detailed explanation requests (e.g. "explain in details", "explain everything", "detail", "guide")
    if any(k in q_lower for k in ["explain", "detail", "everything", "guide", "how to use"]):
        total = db.query(Ticket).count()
        open_count = db.query(Ticket).filter(func.lower(Ticket.status) == "open").count()

        return {
            "answer": (
                "**Comprehensive DeskFlow Operational Guide**\n\n"
                "DeskFlow is built for support staff to manage customer requests efficiently:\n\n"
                "1. **Dashboard & Queue Overview**:\n"
                f"   • Live stats calculated directly from database records ({total} total tickets, {open_count} open).\n"
                "   • Quick preview of recent ticket activity.\n\n"
                "2. **Creating Support Tickets**:\n"
                "   • Fill in customer name, email, subject, description, and priority level.\n"
                "   • Backend generates sequential IDs (**TKT-001**, **TKT-002**) automatically.\n\n"
                "3. **Ticket Priority Triage**:\n"
                "   • 🔴 **Urgent**: Outages / billing errors (SLA: < 1h)\n"
                "   • 🟠 **High**: Login lockouts / API bugs (SLA: < 4h)\n"
                "   • 🟡 **Medium**: General inquiries (SLA: < 24h)\n"
                "   • ⚪ **Low**: Feature requests (SLA: < 48h)\n\n"
                "4. **Status Workflow Lifecycle**:\n"
                "   • Move tickets from **Open** → **In Progress** → **Closed** from ticket details.\n\n"
                "5. **Internal Team Notes**:\n"
                "   • Add timestamped internal staff notes persisted directly to SQLite."
            ),
            "suggested_topics": ["Ticket Priority Guide", "Managing Ticket Statuses"],
        }

    # 3. Check if query asks for live statistics, counts, or open/urgent tickets
    if any(k in q_lower for k in ["count", "how many", "stats", "total", "urgent", "open", "closed"]):
        total = db.query(Ticket).count()
        open_count = db.query(Ticket).filter(func.lower(Ticket.status) == "open").count()
        in_prog_count = db.query(Ticket).filter(func.lower(Ticket.status) == "in progress").count()
        closed_count = db.query(Ticket).filter(func.lower(Ticket.status) == "closed").count()
        urgent_count = db.query(Ticket).filter(func.lower(Ticket.priority) == "urgent").count()

        if "urgent" in q_lower:
            urgent_tickets = db.query(Ticket).filter(func.lower(Ticket.priority) == "urgent").all()
            t_list = ", ".join([f"**{t.ticket_id}** ({t.customer_name})" for t in urgent_tickets[:5]])
            return {
                "answer": (
                    f"There are currently **{urgent_count} Urgent** priority tickets in the support queue.\n\n"
                    f"• **Urgent Tickets**: {t_list if t_list else 'None'}\n\n"
                    f"Urgent tickets involve critical outages, payment failures, or SSL expirations. Triage these first!"
                ),
                "suggested_topics": ["Ticket Priority Guide", "Managing Ticket Statuses"],
            }

        return {
            "answer": (
                f"Here are the live DeskFlow queue statistics from your database:\n\n"
                f"• **Total Tickets**: **{total}**\n"
                f"• **Open**: **{open_count}**\n"
                f"• **In Progress**: **{in_prog_count}**\n"
                f"• **Closed**: **{closed_count}**\n"
                f"• **Urgent Priority**: **{urgent_count}**"
            ),
            "suggested_topics": ["Ticket Priority Guide", "Search & Filter Operations"],
        }

    # 4. Check for priority triage questions
    if any(k in q_lower for k in ["priority", "prioritize", "urgent", "high", "medium", "low", "triage"]):
        return {
            "answer": (
                "DeskFlow uses 4 scannable priority tiers for queue triage:\n\n"
                "🔴 **Urgent**: Critical system outages, payment failures, or domain SSL expirations (SLA: < 1 hour).\n"
                "🟠 **High**: Account access lockouts, API rate limits, or core feature errors (SLA: < 4 hours).\n"
                "🟡 **Medium**: General bugs, export formatting issues, or user seat queries (SLA: < 24 hours).\n"
                "⚪ **Low**: Feature requests, minor UI alignments, or general inquiries (SLA: < 48 hours)."
            ),
            "suggested_topics": ["Managing Ticket Statuses", "How DeskFlow Works"],
        }

    # 5. Check for status workflow questions
    if any(k in q_lower for k in ["status", "workflow", "progress", "closed", "open"]):
        return {
            "answer": (
                "Every ticket transitions through 3 explicit lifecycle statuses:\n\n"
                "1. **Open**: Newly submitted ticket awaiting assignment or first agent response.\n"
                "2. **In Progress**: Support team is actively investigating or communicating with customer.\n"
                "3. **Closed**: Issue resolved, verified, and customer notified.\n\n"
                "Tip: You can update a ticket's status anytime from its Ticket Details page."
            ),
            "suggested_topics": ["Internal Team Notes", "Ticket Priority Guide"],
        }

    # 6. Check for internal notes / collaboration questions
    if any(k in q_lower for k in ["note", "comment", "internal", "team", "collaborate"]):
        return {
            "answer": (
                "Internal notes allow support staff to collaborate behind the scenes:\n\n"
                "• Notes are **timestamped and persisted** in SQLite.\n"
                "• They are visible **only to support staff**, keeping customer views clean.\n"
                "• Use notes to log debugging steps, escalation handles, or customer callbacks."
            ),
            "suggested_topics": ["Managing Ticket Statuses", "How DeskFlow Works"],
        }

    # 7. Check for search & filter questions
    if any(k in q_lower for k in ["search", "filter", "find", "locate"]):
        return {
            "answer": (
                "Quickly locate any request using DeskFlow's multi-attribute search:\n\n"
                "• **Search Bar**: Type customer name, email address, issue title, or Ticket ID (e.g. **TKT-001**).\n"
                "• **Status Filters**: Click on **Open**, **In Progress**, or **Closed** status tabs.\n"
                "• **Priority Filter**: Use the priority dropdown to isolate **Urgent** or **High** tickets."
            ),
            "suggested_topics": ["Ticket Priority Guide", "How DeskFlow Works"],
        }

    # 8. Fallback generic overview for any other question
    return {
        "answer": (
            f"Here is a summary for your question: **{question}**\n\n"
            "DeskFlow is your Customer Support Operations tool. You can:\n"
            "• **Create Tickets**: Capture customer issues with auto-generated IDs (**TKT-XXX**).\n"
            "• **Prioritize Requests**: Triage by **Urgent**, **High**, **Medium**, or **Low** priority.\n"
            "• **Track Statuses**: Manage tickets through **Open**, **In Progress**, and **Closed** states.\n"
            "• **Internal Notes**: Collaborate with your support team directly on ticket records.\n\n"
            "Try asking about a specific ticket (e.g. **What is the status of TKT-001?**) or **How many open tickets are there?**!"
        ),
        "suggested_topics": ["How DeskFlow Works", "Ticket Priority Guide", "Search & Filter Operations"],
    }
