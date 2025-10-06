-- EcoVision Climate Visualizer Database Schema
-- MySQL Database Setup

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS climate_data;
DROP TABLE IF EXISTS metrics;
DROP TABLE IF EXISTS locations;

-- Create locations table
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    region VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create metrics table
CREATE TABLE metrics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create climate_data table
CREATE TABLE climate_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_id INT NOT NULL,
    metric_id INT NOT NULL,
    date DATE NOT NULL,
    value DECIMAL(10,3) NOT NULL,
    quality ENUM('excellent', 'good', 'questionable', 'poor') NOT NULL,
    
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (metric_id) REFERENCES metrics(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_reading (location_id, metric_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

