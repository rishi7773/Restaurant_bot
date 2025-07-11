CREATE DATABASE IF NOT EXISTS restaurant_bot;
USE restaurant_bot;

CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  cuisine VARCHAR(100),
  location VARCHAR(255),
  price_range VARCHAR(50)
);

CREATE TABLE menus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT,
  category VARCHAR(100),
  item_name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  image_url VARCHAR(255),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  restaurant_id INT,
  date_time DATETIME,
  special_requests TEXT,
  status VARCHAR(50),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  restaurant_id INT,
  items JSON,
  total DECIMAL(10,2),
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE user_preferences (
  user_id VARCHAR(255) PRIMARY KEY,
  favorite_cuisines JSON,
  past_orders JSON
);


INSERT INTO restaurants (name, cuisine, location, price_range) VALUES
('Tasty Bistro', 'Italian', 'New York', '$$');

INSERT INTO menus (restaurant_id, category, item_name, description, price, image_url) VALUES
(1, 'Dinner', 'Margherita Pizza', 'Classic pizza with tomato and mozzarella', 10.00, 'https://example.com/pizza.jpg');