CREATE TABLE IF NOT EXISTS shariah_compliant_stocks (
    id SERIAL PRIMARY KEY,
    ticker TEXT UNIQUE NOT NULL,
    company_name TEXT,
    compliance TEXT,
    link TEXT,
    last_updated TIMESTAMP
); 