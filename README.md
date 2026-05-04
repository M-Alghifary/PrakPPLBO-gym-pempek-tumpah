# Gym Management System
Sistem informasi manajemen gym berbasis mobile untuk memudahkan Member dalam booking kelas dan Admin dalam pengelolaan operasional secara real-time

---

## Sprint 1: Requirement & Auth
**Periode:** 2 Februari 2026 - 13 Februari 2026

### Progress Task:
- [x] **1.1 Analisis SRS & Scope Proyek** (Daffa - Scrum Master)
- [x] **1.2 Design Database ERD & Schema** (Ikram & Azriel)
- [x] **1.3 UI/UX Wireframe & Mockup** (Rafly & Yasa (Frontend)) 
- [x] **1.4 API Login & Auth System** (Backend)

### Technical Documentation
https://www.figma.com/design/fTq8VfZoXyemRBN807QXQq/PT-PEMPEK-TUMPAH-MENCARI-CINTA?node-id=0-1&p=f&t=ds2idzijxrb77lIH-0
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

## Cara Run
### Backend
cd backend && ./mvnw spring-boot:run

### Mobile  
cd GymMobile && npx expo start --clear
Tekan 'a' untuk Android emulator

### Test User
Email: test@gmail.com
Password: 12345678

### Catatan
Update IP di GymMobile/src/api/axiosInstance.js 
sesuai IP laptop (cek via ipconfig)
