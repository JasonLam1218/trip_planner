# Running the Application 
1. Clone this repo
2. Navigate to the project directory
2. ```bash python3 -m http.server 8000 ```

The application will be available at http://localhost:8001

# MySQL Data Verification Guide
This guide helps you connect to a MySQL server, create a database and table (if needed), and verify that your backend has successfully stored data.

## Connect to MySQL
    mysql -u root -p

## Create Database and Table (If Not Already Created)
    - create database 
    CREATE DATABASE trip_planner;
    USE trip_planner;

    - create table
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        column1 VARCHAR(255),
        column2 INT
        -- add more columns as needed
    );

## Verify Database and Table
    - List All Databases
    SHOW DATABASES;
    
    - Select Your Database
    USE trip_planner;
    
    - List All Tables
    SHOW TABLES;
    
    - Describe Table Structure
    DESCRIBE users;

## Check if Data Is Stored
    SELECT * FROM users;








