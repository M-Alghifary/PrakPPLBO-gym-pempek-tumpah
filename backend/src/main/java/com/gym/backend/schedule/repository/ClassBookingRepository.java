package com.gym.backend.schedule.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gym.backend.schedule.model.ClassBooking;

@Repository
public interface ClassBookingRepository extends JpaRepository<ClassBooking, Long> {

    // Cek apakah user sudah booking kelas ini
    boolean existsByUserIdAndGymClassId(Long userId, Long gymClassId);

    // Booking aktif user di kelas tertentu
    Optional<ClassBooking> findByUserIdAndGymClassId(Long userId, Long gymClassId);

    // Semua booking user
    List<ClassBooking> findByUserIdOrderByBookedAtDesc(Long userId);

    // Semua peserta di satu kelas
    List<ClassBooking> findByGymClassIdAndStatus(
            Long gymClassId, ClassBooking.Status status);
}