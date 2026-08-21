import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db

# Use in-memory SQLite DB with StaticPool so all connections share the same memory instance
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_create_ticket_success():
    payload = {
        "customer_name": "Rahul Sharma",
        "customer_email": "rahul@example.com",
        "subject": "Unable to access my account",
        "description": "I cannot log in after resetting my password.",
        "priority": "High"
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["ticket_id"] == "TKT-001"
    assert data["customer_name"] == "Rahul Sharma"
    assert data["status"] == "Open"
    assert data["priority"] == "High"
    assert "created_at" in data


def test_create_ticket_validation_error():
    # Invalid email address format
    payload = {
        "customer_name": "Rahul Sharma",
        "customer_email": "not-an-email",
        "subject": "Unable to access account",
        "description": "Some issue text"
    }
    response = client.post("/api/tickets", json=payload)
    assert response.status_code == 422


def test_list_and_search_tickets():
    # Create two tickets
    client.post("/api/tickets", json={
        "customer_name": "Rahul Sharma",
        "customer_email": "rahul@example.com",
        "subject": "Login Issue",
        "description": "Password reset error"
    })
    client.post("/api/tickets", json={
        "customer_name": "Ananya Patel",
        "customer_email": "ananya@example.com",
        "subject": "Billing Refund",
        "description": "Duplicate payment on invoice"
    })

    # List all
    res = client.get("/api/tickets")
    assert res.status_code == 200
    assert len(res.json()) == 2

    # Search for Rahul
    res_search = client.get("/api/tickets?search=Rahul")
    assert res_search.status_code == 200
    results = res_search.json()
    assert len(results) == 1
    assert results[0]["customer_name"] == "Rahul Sharma"


def test_filter_by_status_and_priority():
    t1 = client.post("/api/tickets", json={
        "customer_name": "User One",
        "customer_email": "one@example.com",
        "subject": "Subject One",
        "description": "Description One",
        "priority": "Low"
    }).json()

    t2 = client.post("/api/tickets", json={
        "customer_name": "User Two",
        "customer_email": "two@example.com",
        "subject": "Subject Two",
        "description": "Description Two",
        "priority": "Urgent"
    }).json()

    # Update t2 to In Progress
    client.put(f"/api/tickets/{t2['ticket_id']}", json={"status": "In Progress"})

    # Filter Open status
    open_res = client.get("/api/tickets?status=Open")
    assert len(open_res.json()) == 1
    assert open_res.json()[0]["ticket_id"] == t1["ticket_id"]

    # Filter Urgent priority
    urgent_res = client.get("/api/tickets?priority=Urgent")
    assert len(urgent_res.json()) == 1
    assert urgent_res.json()[0]["ticket_id"] == t2["ticket_id"]


def test_get_ticket_detail_and_not_found():
    created = client.post("/api/tickets", json={
        "customer_name": "Customer Test",
        "customer_email": "test@example.com",
        "subject": "Test Ticket",
        "description": "Detailed explanation"
    }).json()

    t_id = created["ticket_id"]
    res = client.get(f"/api/tickets/{t_id}")
    assert res.status_code == 200
    assert res.json()["ticket_id"] == t_id
    assert res.json()["notes"] == []

    # 404 test
    res_404 = client.get("/api/tickets/TKT-999")
    assert res_404.status_code == 404


def test_update_ticket_and_add_notes():
    created = client.post("/api/tickets", json={
        "customer_name": "Customer Test",
        "customer_email": "test@example.com",
        "subject": "Test Ticket",
        "description": "Detailed explanation"
    }).json()
    t_id = created["ticket_id"]

    # Update status and priority via PUT
    update_res = client.put(f"/api/tickets/{t_id}", json={
        "status": "In Progress",
        "priority": "High",
        "notes": "Initial investigation note"
    })
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "In Progress"
    assert update_res.json()["priority"] == "High"

    # Add another note via POST endpoint
    note_res = client.post(f"/api/tickets/{t_id}/notes", json={"note_text": "Followed up with user"})
    assert note_res.status_code == 201

    # Verify notes in ticket details
    detail_res = client.get(f"/api/tickets/{t_id}")
    notes = detail_res.json()["notes"]
    assert len(notes) == 2
    assert notes[0]["note_text"] == "Initial investigation note"
    assert notes[1]["note_text"] == "Followed up with user"


def test_stats_endpoint():
    client.post("/api/tickets", json={
        "customer_name": "User 1",
        "customer_email": "u1@example.com",
        "subject": "S1",
        "description": "D1"
    })
    t2 = client.post("/api/tickets", json={
        "customer_name": "User 2",
        "customer_email": "u2@example.com",
        "subject": "S2",
        "description": "D2"
    }).json()
    client.put(f"/api/tickets/{t2['ticket_id']}", json={"status": "Closed"})

    res = client.get("/api/tickets/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["total"] == 2
    assert stats["open"] == 1
    assert stats["closed"] == 1
    assert stats["in_progress"] == 0


def test_ai_ask_endpoint():
    # Create a ticket first
    t = client.post("/api/tickets", json={
        "customer_name": "Deepak Verma",
        "customer_email": "deepak@example.com",
        "subject": "Database connection drop",
        "description": "Connection drops every 10 minutes.",
        "priority": "Urgent"
    }).json()

    # Ask AI about ticket TKT-001
    res_ticket = client.post("/api/ai/ask", json={"question": f"What is the status of {t['ticket_id']}?"})
    assert res_ticket.status_code == 200
    assert t['ticket_id'] in res_ticket.json()["answer"]
    assert "Deepak Verma" in res_ticket.json()["answer"]

    # Ask AI about statistics
    res_stats = client.post("/api/ai/ask", json={"question": "How many open tickets are there?"})
    assert res_stats.status_code == 200
    assert "Total Tickets" in res_stats.json()["answer"]

    # Ask AI about priority rules
    res_priority = client.post("/api/ai/ask", json={"question": "How should I prioritize tickets?"})
    assert res_priority.status_code == 200
    assert "Urgent" in res_priority.json()["answer"]
