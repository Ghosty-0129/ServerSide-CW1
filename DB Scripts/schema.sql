-- =============================================================
-- Phantasmagoria Alumni Platform — Full Database Schema
-- Database: phantasmagoria  |  Engine: MySQL 8+
-- =============================================================

CREATE DATABASE IF NOT EXISTS phantasmagoria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phantasmagoria;

-- -------------------------------------------------------------
-- 1. USERS  (core identity + credentials)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255)  UNIQUE NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('alumnus','admin') DEFAULT 'alumnus',
  is_verified   TINYINT(1)    NOT NULL DEFAULT 0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- -------------------------------------------------------------
-- 2. EMAIL VERIFICATION OTPs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_otps (
  id         INT       AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL,
  otp_hash   CHAR(64)  NOT NULL,          -- SHA-256 hex
  expires_at DATETIME  NOT NULL,
  attempts   TINYINT   NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 3. PASSWORD RESET OTPs
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_otps (
  id         INT       AUTO_INCREMENT PRIMARY KEY,
  user_id    INT       NOT NULL,
  otp_hash   CHAR(64)  NOT NULL,
  expires_at DATETIME  NOT NULL,
  attempts   TINYINT   NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 4. ALUMNI PROFILES  (one-to-one with users)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_profiles (
  id                 INT           AUTO_INCREMENT PRIMARY KEY,
  user_id            INT           UNIQUE NOT NULL,
  first_name         VARCHAR(100),
  last_name          VARCHAR(100),
  biography          TEXT,
  linkedin_url       VARCHAR(500),
  profile_image_path VARCHAR(500),
  -- Bidding display fields
  is_active_today    TINYINT(1)    NOT NULL DEFAULT 0,   -- 1 = currently featured
  appearance_count   SMALLINT      NOT NULL DEFAULT 0,   -- total times featured
  created_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 5. DEGREES  (many per profile)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_degrees (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  profile_id      INT          NOT NULL,
  degree_name     VARCHAR(255) NOT NULL,
  institution     VARCHAR(255),
  degree_url      VARCHAR(500),           -- official university degree page
  completion_date DATE,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES alumni_profiles(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 6. PROFESSIONAL CERTIFICATIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_certifications (
  id                   INT          AUTO_INCREMENT PRIMARY KEY,
  profile_id           INT          NOT NULL,
  certification_name   VARCHAR(255) NOT NULL,
  issuing_body         VARCHAR(255),
  cert_url             VARCHAR(500),       -- course/cert page
  completion_date      DATE,
  created_at           TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES alumni_profiles(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 7. PROFESSIONAL LICENCES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_licences (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  profile_id      INT          NOT NULL,
  licence_name    VARCHAR(255) NOT NULL,
  awarding_body   VARCHAR(255),
  licence_url     VARCHAR(500),           -- licence awarding body URL
  completion_date DATE,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES alumni_profiles(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 8. SHORT PROFESSIONAL COURSES
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_courses (
  id              INT          AUTO_INCREMENT PRIMARY KEY,
  profile_id      INT          NOT NULL,
  course_name     VARCHAR(255) NOT NULL,
  provider        VARCHAR(255),
  course_url      VARCHAR(500),           -- course page URL
  completion_date DATE,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES alumni_profiles(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 9. EMPLOYMENT HISTORY
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_employment (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  profile_id INT          NOT NULL,
  job_title  VARCHAR(255) NOT NULL,
  company    VARCHAR(255) NOT NULL,
  start_date DATE         NOT NULL,
  end_date   DATE,                        -- NULL = current position
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES alumni_profiles(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 10. BIDS  (one bid per user per calendar day being bid for)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bids (
  id         INT              AUTO_INCREMENT PRIMARY KEY,
  user_id    INT              NOT NULL,
  bid_date   DATE             NOT NULL,          -- the date being bid FOR (tomorrow)
  amount     DECIMAL(10,2)    NOT NULL,
  status     ENUM('pending','won','lost') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_bid_date (user_id, bid_date),   -- one bid per user per slot
  INDEX idx_bid_date (bid_date),
  INDEX idx_status  (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 11. MONTHLY BID WINS  (enforce 3-win / month cap)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_bid_wins (
  id           INT      AUTO_INCREMENT PRIMARY KEY,
  user_id      INT      NOT NULL,
  year         YEAR     NOT NULL,
  month        TINYINT  NOT NULL,          -- 1-12
  win_count    TINYINT  NOT NULL DEFAULT 0,
  event_bonus  TINYINT(1) NOT NULL DEFAULT 0,  -- 1 = attended alumni event → +1 slot
  UNIQUE KEY uq_user_year_month (user_id, year, month),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 12. CLIENT API KEYS  (developer / external clients)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  client_name  VARCHAR(255) NOT NULL,
  key_hash     CHAR(64)     NOT NULL UNIQUE,   -- SHA-256 of raw key
  key_prefix   VARCHAR(12)  NOT NULL,           -- first chars shown in dashboard
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_by   INT,                             -- admin user id
  last_used_at TIMESTAMP    NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- 13. API KEY USAGE LOGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  api_key_id  INT          NOT NULL,
  endpoint    VARCHAR(500) NOT NULL,
  method      VARCHAR(10)  NOT NULL,
  ip_address  VARCHAR(45),
  accessed_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_api_key_id  (api_key_id),
  INDEX idx_accessed_at (accessed_at),
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);
