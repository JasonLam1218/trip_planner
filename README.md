# Running the Application
    1. Clone this repo
    2. Navigate to the project directory
    3. localhost
        python3 -m http.server 8001
        node server.js

The application will be available at http://localhost:8001

    Run the application via Vercel
    https://trip-planner-git-dev-jasonlam1218s-projects.vercel.app/

# Running the Application using Vercel
    1. Register an Email or Sign Up
    2. Connect to GitHub
        ∙ Click the New Project button
        ∙ Import GitHub Repository and choose the repository 
    3. Deploy Your Application

The applicaiton will be acailable at https://trip-planner-git-dev-jasonlam1218s-projects.vercel.app/

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

## Delete existing user
    DELETE FROM users WHERE id = 1
    
## Restart ID with 1 (only if the table is empty)
    ALTER TABLE users AUTO_INCREMENT = 1;

# Calling API 
    - Geoapify (location)
    https://myprojects.geoapify.com/api/EsZj7VDNbWbyThWSu8zW/keys

    - Pexels (image)
    https://www.pexels.com/api/key/