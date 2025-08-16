-- BillSense Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bills table
CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(500),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bill items table
CREATE TABLE bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1
);

-- Bill participants table
CREATE TABLE bill_participants (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL -- For non-registered users
);

-- Item assignments table (many-to-many between items and participants)
CREATE TABLE item_assignments (
    id SERIAL PRIMARY KEY,
    bill_item_id INTEGER REFERENCES bill_items(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES bill_participants(id) ON DELETE CASCADE,
    share_percentage DECIMAL(5,2) DEFAULT 100.00 -- Allows partial sharing
);

-- Final splits table
CREATE TABLE bill_splits (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES bill_participants(id) ON DELETE CASCADE,
    amount_owed DECIMAL(10,2) NOT NULL,
    items_share DECIMAL(10,2) NOT NULL,
    tax_share DECIMAL(10,2) NOT NULL,
    tip_share DECIMAL(10,2) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_bills_created_by ON bills(created_by);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_bill_participants_bill_id ON bill_participants(bill_id);
CREATE INDEX idx_item_assignments_bill_item_id ON item_assignments(bill_item_id);
CREATE INDEX idx_item_assignments_participant_id ON item_assignments(participant_id);
CREATE INDEX idx_bill_splits_bill_id ON bill_splits(bill_id);

-- Sample data for development
INSERT INTO users (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com');
