package com.gym.backend.schedule.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gym.backend.schedule.model.GymClass;

@Repository
public interface GymClassRepository extends JpaRepository<GymClass, Long> {

    // Jadwal kelas dari sekarang ke depan
    List<GymClass> findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime now);

    // Jadwal kelas berdasarkan trainer
    List<GymClass> findByTrainerIdOrderByStartTimeAsc(Long trainerId);
}