-- EduVision Enterprise Staff KYC Schema Migration
-- Run this in your Supabase SQL Editor if you want dedicated status/percentage columns

ALTER TABLE IF EXISTS counsellors 
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Not Submitted',
  ADD COLUMN IF NOT EXISTS verification_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pan_url text,
  ADD COLUMN IF NOT EXISTS id_proof_url text;

ALTER TABLE IF EXISTS team_leaders 
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Not Submitted',
  ADD COLUMN IF NOT EXISTS verification_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pan_url text,
  ADD COLUMN IF NOT EXISTS id_proof_url text,
  ADD COLUMN IF NOT EXISTS aadhaar_number text,
  ADD COLUMN IF NOT EXISTS pan_number text,
  ADD COLUMN IF NOT EXISTS bank_account_no text,
  ADD COLUMN IF NOT EXISTS ifsc_code text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS drive_url text;

ALTER TABLE IF EXISTS admin_users 
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Not Submitted',
  ADD COLUMN IF NOT EXISTS verification_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pan_url text,
  ADD COLUMN IF NOT EXISTS id_proof_url text;

ALTER TABLE IF EXISTS associate_partners 
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'Not Submitted',
  ADD COLUMN IF NOT EXISTS verification_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pan_url text,
  ADD COLUMN IF NOT EXISTS id_proof_url text;