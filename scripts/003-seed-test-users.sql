-- Insert test users (password is 'password123' hashed with bcrypt)
INSERT INTO users (email, username, password_hash, first_name, last_name, bio, location, is_verified) VALUES
(
  'john.doe@example.com',
  'johndoe',
  '$2b$10$rQZ8kHWiZ8.vQXKvQXKvQeJ8kHWiZ8.vQXKvQXKvQeJ8kHWiZ8.vQX',
  'John',
  'Doe',
  'Explorateur urbain passionné de Paris',
  'Paris, France',
  true
),
(
  'marie.martin@example.com',
  'mariemartin',
  '$2b$10$rQZ8kHWiZ8.vQXKvQXKvQeJ8kHWiZ8.vQXKvQXKvQeJ8kHWiZ8.vQX',
  'Marie',
  'Martin',
  'Organisatrice d''événements culturels',
  'Paris, France',
  true
),
(
  'alex.dubois@example.com',
  'alexdubois',
  '$2b$10$rQZ8kHWiZ8.vQXKvQXKvQeJ8kHWiZ8.vQXKvQXKvQeJ8kHWiZ8.vQX',
  'Alex',
  'Dubois',
  'Amateur de musique et de soirées',
  'Paris, France',
  false
);
