package com.gym.backend.workout.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gym.backend.workout.model.WorkoutLog;

@Repository
public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {

    // Semua log milik user, terbaru duluan
    List<WorkoutLog> findByUserIdOrderByWorkoutDateDesc(Long userId);

    // Log berdasarkan tanggal tertentu
    List<WorkoutLog> findByUserIdAndWorkoutDateOrderByCreatedAtDesc(
            Long userId, LocalDate date);

    // Log dalam rentang tanggal
    List<WorkoutLog> findByUserIdAndWorkoutDateBetweenOrderByWorkoutDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate);
}