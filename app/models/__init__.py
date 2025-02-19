from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role
        }

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String(30), nullable=False)
    jersey_number = db.Column(db.Integer)
    position = db.Column(db.String(30))
    phone = db.Column(db.String(20))
    emergency_contact = db.Column(db.String(100))
    photo_url = db.Column(db.String(255))
    active = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'category': self.category,
            'jersey_number': self.jersey_number,
            'position': self.position,
            'phone': self.phone,
            'emergency_contact': self.emergency_contact,
            'photo_url': self.photo_url,
            'active': self.active
        }

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(100))
    event_type = db.Column(db.String(50))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'event_date': self.event_date.isoformat(),
            'location': self.location,
            'event_type': self.event_type
        }

class News(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'image_url': self.image_url,
            'created_at': self.created_at.isoformat()
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_type = db.Column(db.String(50), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    transaction_id = db.Column(db.String(100))
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'amount': float(self.amount),
            'payment_type': self.payment_type,
            'payment_method': self.payment_method,
            'status': self.status,
            'payment_date': self.payment_date.isoformat()
        }

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(db.Integer, db.ForeignKey('player.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'present', 'absent', 'excused'
    notes = db.Column(db.Text)
    category = db.Column(db.String(30))  # Added category field
    recorded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    excuse_document = db.Column(db.String(255))  # URL to excuse document if applicable

    def to_dict(self):
        return {
            'id': self.id,
            'player_id': self.player_id,
            'event_id': self.event_id,
            'status': self.status,
            'notes': self.notes,
            'category': self.category,
            'recorded_at': self.recorded_at.isoformat(),
            'excuse_document': self.excuse_document
        }

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    file_url = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'document_type': self.document_type,
            'uploaded_at': self.uploaded_at.isoformat()
        }

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    age_min = db.Column(db.Integer)
    age_max = db.Column(db.Integer)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'age_min': self.age_min,
            'age_max': self.age_max
        }
