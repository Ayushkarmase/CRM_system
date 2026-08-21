from datetime import datetime, timedelta
from app.database import Base, engine, SessionLocal
from app.models import Ticket, Note

SAMPLE_TICKETS = [
    {
        "customer_name": "Rahul Sharma",
        "customer_email": "rahul.sharma@example.com",
        "subject": "Unable to access my account after password reset",
        "description": "I requested a password reset link yesterday and changed my password. However, whenever I try logging in with the new credentials, I receive an 'Invalid Session' error message on the login screen.",
        "status": "Open",
        "priority": "High",
        "hours_ago": 2,
        "notes": [
            "Customer reached out via support portal. Checked error logs and verified active session invalidation issue.",
            "Initial troubleshooting step: Requested customer to clear browser cache & cookies."
        ]
    },
    {
        "customer_name": "Ananya Patel",
        "customer_email": "ananya.p@designstudio.io",
        "subject": "Duplicate charge on monthly subscription invoice",
        "description": "Our team was billed twice for the Professional Plan on August 15th (Invoice #INV-9042 and #INV-9043). Please refund the duplicate transaction of $149.00 to our original payment method.",
        "status": "In Progress",
        "priority": "Urgent",
        "hours_ago": 5,
        "notes": [
            "Verified duplicate payment in Stripe billing dashboard. Invoice #INV-9043 was indeed generated twice due to retry webhook.",
            "Refund request initiated with finance operations team. Awaiting transaction reference ID."
        ]
    },
    {
        "customer_name": "Marcus Vance",
        "customer_email": "marcus.vance@techcorp.com",
        "subject": "API webhook notifications failing with 504 Gateway Timeout",
        "description": "Our webhook receiver at https://api.techcorp.com/deskflow-hook is failing to process events. The request payload seems to timeout after 10 seconds. Need higher timeout threshold or queue retry support.",
        "status": "In Progress",
        "priority": "High",
        "hours_ago": 12,
        "notes": [
            "Escalated to engineering infra team. Webhook retry mechanism currently caps execution at 10s.",
            "Dev team investigating payload delivery batching option for high volume webhooks."
        ]
    },
    {
        "customer_name": "Priyanjali Sengupta",
        "customer_email": "priyanjali@fintechsolutions.in",
        "subject": "Request for GST invoice details update for Q3",
        "description": "We recently updated our company GSTIN number. Could you please update our billing profile with GSTIN: 27AABCU9603R1ZN so our upcoming quarterly invoices reflect the correct tax breakdown?",
        "status": "Closed",
        "priority": "Low",
        "hours_ago": 24,
        "notes": [
            "Tax records updated in billing profile.",
            "Sent revised Q3 draft invoice to customer email."
        ]
    },
    {
        "customer_name": "David Chen",
        "customer_email": "dchen@globallogistics.org",
        "subject": "CSV Export feature returning empty file for large date ranges",
        "description": "When exporting ticket history for the date range Jan 1 - Jul 31, the generated CSV file downloads as 0 bytes. Smaller date ranges (e.g. 1 month) export without any issue.",
        "status": "Open",
        "priority": "Medium",
        "hours_ago": 30,
        "notes": [
            "Reproduced issue in staging environment. Memory limit reached on backend streaming worker when processing >5,000 records."
        ]
    },
    {
        "customer_name": "Vikram Malhotra",
        "customer_email": "vikram.m@startupstack.in",
        "subject": "Feature Request: Custom tags for ticket categorization",
        "description": "Our support team would love to organize incoming requests using custom tags like #bug, #billing, #onboarding. Is this feature currently on the product roadmap?",
        "status": "Closed",
        "priority": "Low",
        "hours_ago": 48,
        "notes": [
            "Logged feature request ticket in Jira (FEAT-318) for Product Management review.",
            "Informed customer about the roadmap item and provided workaround using Priority filters."
        ]
    }
]

def auto_seed_if_empty():
    """Auto-seeds default tickets if the database is currently empty."""
    db = SessionLocal()
    try:
        existing = db.query(Ticket).count()
        if existing > 0:
            return

        now = datetime.utcnow()
        for idx, sample in enumerate(SAMPLE_TICKETS, start=1):
            ticket_id = f"TKT-{idx:03d}"
            created_at = now - timedelta(hours=sample["hours_ago"])
            updated_at = created_at + timedelta(minutes=30)

            ticket = Ticket(
                ticket_id=ticket_id,
                customer_name=sample["customer_name"],
                customer_email=sample["customer_email"],
                subject=sample["subject"],
                description=sample["description"],
                status=sample["status"],
                priority=sample["priority"],
                created_at=created_at,
                updated_at=updated_at,
            )
            db.add(ticket)
            db.flush()

            for note_idx, note_text in enumerate(sample.get("notes", [])):
                note_time = created_at + timedelta(minutes=(note_idx + 1) * 15)
                note = Note(
                    ticket_id=ticket.id,
                    note_text=note_text,
                    created_at=note_time,
                )
                db.add(note)

        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during auto-seed: {e}")
    finally:
        db.close()
