package com.gym.backend.schedule.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.BadRequestException;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.schedule.dto.ClassBookingResponse;
import com.gym.backend.schedule.dto.GymClassRequest;
import com.gym.backend.schedule.dto.GymClassResponse;
import com.gym.backend.schedule.dto.ParticipantResponse;
import com.gym.backend.schedule.model.ClassBooking;
import com.gym.backend.schedule.model.GymClass;
import com.gym.backend.schedule.repository.ClassBookingRepository;
import com.gym.backend.schedule.repository.GymClassRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final GymClassRepository gymClassRepository;
    private final ClassBookingRepository bookingRepository;
    private final UserRepository userRepository;

    // ── Admin/Trainer: kelola kelas ───────────────────────────────────────

    public GymClassResponse createClass(GymClassRequest request) {
        User trainer = null;
        if (request.getTrainerId() != null) {
            trainer = userRepository.findById(request.getTrainerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer tidak ditemukan"));
        }

        GymClass gymClass = GymClass.builder()
                .name(request.getName())
                .description(request.getDescription())
                .trainer(trainer)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .maxCapacity(request.getMaxCapacity())
                .build();

        gymClassRepository.save(gymClass);
        return toClassResponse(gymClass);
    }

    // ── Member: lihat jadwal & booking ────────────────────────────────────
    
    @Transactional(readOnly = true)
    public List<GymClassResponse> getUpcomingClasses() {
        return gymClassRepository
                .findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now())
                .stream()
                .map(this::toClassResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClassBookingResponse bookClass(String email, Long classId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        GymClass gymClass = gymClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Kelas tidak ditemukan"));

        if (gymClass.getStatus() == GymClass.Status.CANCELLED) {
            throw new BadRequestException("Kelas ini sudah dibatalkan");
        }

        if (gymClass.isFull()) {
            throw new BadRequestException("Kuota kelas sudah penuh");
        }

        if (bookingRepository.existsByUserIdAndGymClassId(user.getId(), classId)) {
            throw new BadRequestException("Kamu sudah melakukan booking kelas ini");
        }

        // Kurangi slot dan update status kalau penuh
        gymClass.setCurrentCapacity(gymClass.getCurrentCapacity() + 1);
        if (gymClass.isFull()) {
            gymClass.setStatus(GymClass.Status.FULL);
        }
        gymClassRepository.save(gymClass);

        ClassBooking booking = ClassBooking.builder()
                .user(user)
                .gymClass(gymClass)
                .build();

        bookingRepository.save(booking);
        return toBookingResponse(booking);
    }

    @Transactional
    public ClassBookingResponse cancelBooking(String email, Long classId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        ClassBooking booking = bookingRepository
                .findByUserIdAndGymClassId(user.getId(), classId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking tidak ditemukan"));

        if (booking.getStatus() == ClassBooking.Status.CANCELLED) {
            throw new BadRequestException("Booking sudah dibatalkan sebelumnya");
        }

        booking.setStatus(ClassBooking.Status.CANCELLED);
        bookingRepository.save(booking);

        // Kembalikan slot
        GymClass gymClass = booking.getGymClass();
        gymClass.setCurrentCapacity(Math.max(gymClass.getCurrentCapacity() - 1, 0));
        if (gymClass.getStatus() == GymClass.Status.FULL) {
            gymClass.setStatus(GymClass.Status.OPEN);
        }
        gymClassRepository.save(gymClass);

        return toBookingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<ClassBookingResponse> getMyBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return bookingRepository.findByUserIdOrderByBookedAtDesc(user.getId())
                .stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }

    // ── Trainer: lihat kelas & peserta ───────────────────────────────────

    @Transactional(readOnly = true)
    public List<GymClassResponse> getMyClasses(String email) {
        User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return gymClassRepository
                .findByTrainerIdOrderByStartTimeAsc(trainer.getId())
                .stream()
                .map(this::toClassResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ParticipantResponse> getClassParticipants(String email, Long classId) {
        User trainer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        GymClass gymClass = gymClassRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Kelas tidak ditemukan"));

        // Pastikan kelas ini milik trainer yang login
        if (gymClass.getTrainer() == null ||
                !gymClass.getTrainer().getId().equals(trainer.getId())) {
            throw new ResourceNotFoundException("Kelas tidak ditemukan");
        }

        return bookingRepository
                .findByGymClassIdAndStatus(classId, ClassBooking.Status.BOOKED)
                .stream()
                .map(b -> ParticipantResponse.builder()
                        .bookingId(b.getId())
                        .userId(b.getUser().getId())
                        .memberName(b.getUser().getName())
                        .memberEmail(b.getUser().getEmail())
                        .status(b.getStatus().name())
                        .bookedAt(b.getBookedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Mapper ────────────────────────────────────────────────────────────

    private GymClassResponse toClassResponse(GymClass c) {
        return GymClassResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .trainerName(c.getTrainer() != null ? c.getTrainer().getName() : "TBA")
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .maxCapacity(c.getMaxCapacity())
                .currentCapacity(c.getCurrentCapacity())
                .remainingSlots(c.getRemainingSlots())
                .status(c.getStatus().name())
                .build();
    }

    private ClassBookingResponse toBookingResponse(ClassBooking b) {
        GymClass c = b.getGymClass();
        return ClassBookingResponse.builder()
                .bookingId(b.getId())
                .classId(c.getId())
                .className(c.getName())
                .trainerName(c.getTrainer() != null ? c.getTrainer().getName() : "TBA")
                .startTime(c.getStartTime())
                .endTime(c.getEndTime())
                .status(b.getStatus().name())
                .bookedAt(b.getBookedAt())
                .build();
    }
}