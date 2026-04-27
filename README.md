# Gym Management System
Sistem informasi manajemen gym berbasis mobile untuk memudahkan Member dalam booking kelas dan Admin dalam pengelolaan operasional secara real-time

# Daftar Isi
Tentang Proyek

Teknologi yang Digunakan

Struktur Tim

Rencana Pengembangan (Roadmap)

Progres Sprint

# Tentang Proyek

Proyek ini bertujuan untuk mendigitalisasi operasional gym, mulai dari sistem autentikasi, manajemen keanggotaan, penjadwalan kelas, hingga integrasi pembayaran.

# Teknologi yang Digunakan

Backend: Spring Boot 3.5.13 (Java 22) 


Frontend: JavaScript (Mobile/Web Development) 


Database: MySQL 


Tools: Laragon/XAMPP, Maven Wrapper 

# Rencana Pengembangan (Roadmap)
Berdasarkan WBS proyek ini dibagi menjadi 6 Sprint utama:

Sprint 1: Requirement & Auth (Februari) 

Sprint 2: Membership Phase (Februari)

Sprint 3: Class & Scheduling (Maret)

Sprint 4: Booking & QR Check-in (Maret)

Sprint 5: Payment & Tracking (April)

Sprint 6: Final QA & Deploy (April)

Panduan Instalasi
---

## Sprint 1: Requirement & Auth
**Periode:** 2 Februari 2026 - 13 Februari 2026

### Progress Task:
- [x] **1.1 Analisis SRS & Scope Proyek** (Daffa - Scrum Master)
- [x] **1.2 Design Database ERD & Schema** (Ikram & Azriel)
- [x] **1.3 UI/UX Wireframe & Mockup** (Rafly & Yasa (Frontend)) 
- [x] **1.4 API Login & Auth System** (Backend)

## Sprint 2: Membership Phase
**Periode:** 16 Februari 2026 - 27 Februari 2026

### Progress Task:
- [ ] 2.1 CRUD Data Member & Gym Paket (Backend 1)
- [ ] 2.2 UI Dashboard & Profil Member (Frontend 2)
- [ ] 2.3 Unit Testing Fitur Registrasi (QA Tester)

## Sprint 3: Class & Scheduling
**Periode:** 2 Maret 2026 - 13 Maret 2026

### Progress Task:
- [ ] 3.1 Manajemen Jadwal Kelas - Admin (Backend 2)
- [ ] 3.2 Katalog Kelas & Filter UI (Frontend 1)
- [ ] 3.3 Logic Validasi Sisa Kuota (Backend 1)

### Technical Documentation
#### Database Entity Relationship Diagram (ERD)

## Stack
- Backend: Spring Boot 3.5.13, Java 22, MySQL
- Frontend: (coming soon)

## Cara Menjalankan Backend

1. Pastikan MySQL aktif (Laragon / XAMPP)
2. Buat database: `CREATE DATABASE gym_db;`
3. Sesuaikan `application-dev.yml` dengan credential MySQL kamu
4. Jalankan: `cd backend && ./mvnw spring-boot:run`

## Struktur Project
Lihat `backend/src/main/java/com/gym/backend/`
