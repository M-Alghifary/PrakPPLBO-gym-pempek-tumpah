# Gym Management System
Sistem informasi manajemen gym berbasis mobile untuk memudahkan Member dalam booking kelas dan Admin dalam pengelolaan operasional secara real-time

---

# Teknologi yang Digunakan
- Backend: Spring Boot 3.5.13 (Java 22) 
- Frontend: JavaScript (Mobile/Web Development) 
- Database: MySQL 
- Tools: Laragon/XAMPP, Maven Wrapper

---

# Rencana Pengembangan (Roadmap)
Berdasarkan WBS, proyek ini dibagi menjadi 6 Sprint utama:
1. Sprint 1: Requirement & Auth (Februari) 
2. Sprint 2: Membership Phase (Februari)
3. Sprint 3: Class & Scheduling (Maret)
4. Sprint 4: Booking & QR Check-in (Maret)
5. Sprint 5: Payment & Tracking (April)
6. Sprint 6: Final QA & Deploy (April)

---

# Progres Sprint
## Sprint 1: Requirement & Auth
**Periode:** 2 Februari 2026 - 13 Februari 2026

### Progress Task:
- [x] **1.1 Analisis SRS & Scope Proyek**
- [x] **1.2 Design Database ERD & Schema** 
- [x] **1.3 UI/UX Wireframe & Mockup** 
- [x] **1.4 API Login & Auth System**

## Sprint 2: Membership Phase
**Periode:** 16 Februari 2026 - 27 Februari 2026.

### Progress Task:
- [x] **2.1 CRUD Data Member & Gym Paket** 
- [x] **2.2 UI Dashboard & Profil Member** 
- [x] **2.3 Unit Testing Fitur Registrasi**

## Sprint 3: Class & Scheduling
**Periode:** 2 Maret 2026 - 13 Maret 2026

### Progress Task:
- [x] **3.1 Manajemen Jadwal Kelas - Admin** 
- [x] **3.2 Katalog Kelas & Filter UI** 
- [x] **3.3 Logic Validasi Sisa Kuota**

## Sprint 4: Booking & QR Check-in
**Periode:** 16 Maret 2026 - 27 Maret 2026

### Progress Task:
- [x] **4.1 Fitur Booking Slot API** 
- [x] **4.2 UI Booking & My Schedule** 
- [x] **4.3 Sistem Absensi QR Code**

## Sprint 5: Payment & Tracking
**Periode:** 30 Maret 2026 - 10 April 2026

### Progress Task:
- [x] **5.1 Integrasi Payment Gateway** 
- [x] **5.2 Kalkulator BMI & Log Latihan** 
- [x] **5.3 Laporan Riwayat Transaksi**

## Sprint 6: Final QA & Deploy
**Periode:** 13 April 2026 - 24 April 2026

### Progress Task:
- [x] **6.1 User Acceptance Testing** 
- [x] **6.2 Penyusunan User Manual & Dokumen** 
- [x] **6.3 Deployment & Final Presentation**

---

### Technical Documentation
#### Mockup UI/UX design (Rafly & Yasa)
https://www.figma.com/design/fTq8VfZoXyemRBN807QXQq/PT-PEMPEK-TUMPAH-MENCARI-CINTA?node-id=0-1&p=f&t=ds2idzijxrb77lIH-0
#### Database Entity Relationship Diagram (ERD)

---

# Langkah-langkah run project

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
