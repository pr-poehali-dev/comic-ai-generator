
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL DEFAULT '',
    style VARCHAR(50) NOT NULL DEFAULT '',
    panels JSONB NOT NULL DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    style VARCHAR(50) NOT NULL DEFAULT '',
    color VARCHAR(100) NOT NULL DEFAULT 'from-purple-500 to-cyan-400',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comics_user_id ON comics(user_id);
CREATE INDEX idx_characters_user_id ON characters(user_id);
