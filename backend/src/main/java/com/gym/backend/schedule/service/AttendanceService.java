package com.gym.backend.schedule.service;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.zxing.WriterException;
import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.BadRequestException;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.common.util.QrCodeUtil;
import com.gym.backend.schedule.dto.AttendanceResponse;
import com.gym.backend.schedule.dto.QrCodeResponse;
import com.gym.backend.schedule.model.ClassAttendance;
import com.gym.backend.schedule.model.ClassBooking;
import com.gym.backend.schedule.model.GymClass;
import com.gym.backend.schedule.repository.ClassAttendanceRepository;
import com.gym.backend.schedule.repository.ClassBookingRepository;
import com.gym.backend.schedule.repository.GymClassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final GymClassRepository gymClassRepository;
    private final ClassBookingRepository bookingRepository;
    private final ClassAttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    // Admin/Trainer generate QR untuk kelas
    public QrCodeResponse generateQrCode(Long classId) {
        GymClass gymClass = gymClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Kelas tidak ditemukan"));

        if (gymClass.getStatus() == GymClass.Status.CANCELLED) {
            throw new BadRequestException("Kelas sudah dibatalkan");
        }

        // Token sederhana: classId + timestamp — bisa diganti JWT nanti
        String qrToken = "GYM-CLASS-" + classId + "-" + System.currentTimeMillis();

        try {
            String qrBase64 = QrCodeUtil.generateQrCodeBase64(qrToken, 300, 300);

            return QrCodeResponse.builder()
                    .classId(classId)
                    .className(gymClass.getName())
                    .qrCodeBase64(qrBase64)
                    .qrToken(qrToken)
                    .build();

        } catch (WriterException | IOException e) {
            throw new RuntimeException("Gagal generate QR Code: " + e.getMessage());
        }
    }

    // Member scan QR — catat presensi
    @Transactional
    public AttendanceResponse scanQrCode(String email, Long classId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        GymClass gymClass = gymClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Kelas tidak ditemukan"));

        // Cek apakah member sudah booking kelas ini
        boolean hasBooking = bookingRepository
                .existsByUserIdAndGymClassIdAndStatus(user.getId(), classId, ClassBooking.Status.BOOKED);

        if (!hasBooking) {
            throw new BadRequestException("Kamu belum melakukan booking kelas ini");
        }

        // Cek apakah sudah presensi sebelumnya
        if (attendanceRepository.existsByUserIdAndGymClassId(user.getId(), classId)) {
                throw new BadRequestException("Kamu sudah melakukan presensi untuk kelas ini");
        }

        // Catat presensi
        ClassAttendance attendance = ClassAttendance.builder()
                .user(user)
                .gymClass(gymClass)
                .build();

        attendanceRepository.save(attendance);

        // Update status booking jadi ATTENDED
        bookingRepository.findByUserIdAndGymClassId(user.getId(), classId)
                .ifPresent(booking -> {
                    booking.setStatus(ClassBooking.Status.ATTENDED);
                    bookingRepository.save(booking);
                });

        return AttendanceResponse.builder()
                .id(attendance.getId())
                .memberName(user.getName())
                .memberEmail(user.getEmail())
                .className(gymClass.getName())
                .attendedAt(attendance.getAttendedAt())
                .build();
    }

    // Lihat daftar presensi per kelas
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getClassAttendances(Long classId) {
        gymClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Kelas tidak ditemukan"));

        return attendanceRepository.findByGymClassId(classId)
                .stream()
                .map(a -> AttendanceResponse.builder()
                        .id(a.getId())
                        .memberName(a.getUser().getName())
                        .memberEmail(a.getUser().getEmail())
                        .className(a.getGymClass().getName())
                        .attendedAt(a.getAttendedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // Riwayat presensi member
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendances(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return attendanceRepository.findByUserIdOrderByAttendedAtDesc(user.getId())
                .stream()
                .map(a -> AttendanceResponse.builder()
                        .id(a.getId())
                        .memberName(a.getUser().getName())
                        .memberEmail(a.getUser().getEmail())
                        .className(a.getGymClass().getName())
                        .attendedAt(a.getAttendedAt())
                        .build())
                .collect(Collectors.toList());
    }
}