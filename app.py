from flask import Flask, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import json
import models

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/cambridge_fc.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Importar modelos
from models import User, Player, Event, News, Payment, Attendance, Document, Category


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Rutas de autenticación
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        username=data['username'],
        email=data['email'],
        role=data['role']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({'message': 'Logged in successfully'})
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Rutas de jugadores
@app.route('/api/players', methods=['GET', 'POST'])
@login_required
def players():
    if request.method == 'POST':
        if current_user.role not in ['admin', 'coach']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        
        # Crear el jugador con los campos actualizados
        player = Player(
            first_name=data['firstName'],
            last_name=data['lastName'],
            birth_date=datetime.strptime(data['birthDate'], '%Y-%m-%d'),
            category=data['category'],  # La categoría ahora se calcula automáticamente en el frontend
            position=data.get('position'),
            jersey_number=data.get('jerseyNumber'),
            phone=data.get('phone'),
            emergency_contact=data.get('emergencyContact')
        )
        
        try:
            db.session.add(player)
            db.session.commit()
            return jsonify({
                'message': 'Jugador registrado exitosamente',
                'player': player.to_dict()
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    # GET request - listar jugadores
    category = request.args.get('category')
    if category:
        players = Player.query.filter_by(category=category).all()
    else:
        players = Player.query.all()
    return jsonify([player.to_dict() for player in players])

# Rutas de eventos
@app.route('/api/events', methods=['GET', 'POST'])
@login_required
def events():
    if request.method == 'POST':
        if current_user.role not in ['admin', 'coach']:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.json
        event = Event(
            title=data['title'],
            description=data['description'],
            event_date=datetime.strptime(data['event_date'], '%Y-%m-%d %H:%M'),
            location=data['location'],
            event_type=data['event_type'],
            created_by=current_user.id
        )
        db.session.add(event)
        db.session.commit()
        return jsonify({'message': 'Event created successfully'}), 201
    
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events])

# Rutas de asistencia
@app.route('/api/attendance', methods=['POST'])
@login_required
def record_attendance():
    if current_user.role not in ['admin', 'coach']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.json
    attendance = Attendance(
        player_id=data['player_id'],
        event_id=data['event_id'],
        status=data['status'],
        notes=data.get('notes'),
        recorded_by=current_user.id
    )
    db.session.add(attendance)
    db.session.commit()
    return jsonify({'message': 'Attendance recorded successfully'}), 201

@app.route('/api/attendance/report/<event_id>')
@login_required
def generate_attendance_report(event_id):
    if current_user.role not in ['admin', 'coach']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    event = Event.query.get_or_404(event_id)
    attendances = Attendance.query.filter_by(event_id=event_id).all()
    
    # Generar PDF
    pdf_path = f'attendance_report_{event_id}.pdf'
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.drawString(100, 750, f"Attendance Report - {event.title}")
    c.drawString(100, 730, f"Date: {event.event_date}")
    
    y = 700
    for attendance in attendances:
        player = Player.query.get(attendance.player_id)
        c.drawString(100, y, f"{player.first_name} {player.last_name} - {attendance.status}")
        y -= 20
    
    c.save()
    return send_file(pdf_path, as_attachment=True)

# Rutas de pagos
@app.route('/api/payments', methods=['POST'])
@login_required
def record_payment():
    data = request.json
    payment = Payment(
        player_id=data['player_id'],
        amount=data['amount'],
        payment_type=data['payment_type'],
        payment_method=data['payment_method'],
        transaction_id=data.get('transaction_id'),
        status='completed'
    )
    db.session.add(payment)
    db.session.commit()
    return jsonify({'message': 'Payment recorded successfully'}), 201

# Rutas de documentos
@app.route('/api/documents', methods=['POST'])
@login_required
def upload_document():
    if current_user.role not in ['admin', 'coach']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    document = Document(
        title=request.form['title'],
        description=request.form.get('description'),
        file_url=file_path,
        document_type=request.form['document_type'],
        uploaded_by=current_user.id
    )
    db.session.add(document)
    db.session.commit()
    
    return jsonify({'message': 'Document uploaded successfully'}), 201

if __name__ == '__main__':
    if not os.path.exists('database'):
        os.makedirs('database')
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    db.create_all()
    app.run(debug=True)
