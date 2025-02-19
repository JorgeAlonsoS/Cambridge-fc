-- Tabla de Usuarios (Entrenadores y Administradores)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'admin', 'coach', 'player'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Jugadores
CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    category VARCHAR(30) NOT NULL, -- 'sub-15', 'sub-17', etc.
    jersey_number INTEGER,
    position VARCHAR(30),
    phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    medical_info TEXT,
    photo_url VARCHAR(255),
    active BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla de Eventos
CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(100),
    event_type VARCHAR(50), -- 'training', 'match', 'tournament'
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de Noticias
CREATE TABLE news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de Pagos
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'matricula', 'mensualidad', 'uniforme'
    payment_method VARCHAR(50) NOT NULL, -- 'nequi', 'bancolombia', 'crediservir'
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed'
    FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Tabla de Asistencias
CREATE TABLE attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'present', 'absent', 'excused'
    notes TEXT,
    recorded_by INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- Tabla de Documentos
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    file_url VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'training_plan', 'schedule', 'attendance_report'
    uploaded_by INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Tabla de Categorías
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    age_min INTEGER,
    age_max INTEGER
);

-- Índices para optimizar búsquedas
CREATE INDEX idx_players_category ON players(category);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_payments_player ON payments(player_id);
CREATE INDEX idx_attendance_player ON attendance(player_id);
CREATE INDEX idx_attendance_event ON attendance(event_id);
