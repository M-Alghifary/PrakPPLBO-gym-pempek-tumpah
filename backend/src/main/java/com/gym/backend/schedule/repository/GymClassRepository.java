package com.gym.backend.schedule.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gym.backend.schedule.model.GymClass;

@Repository
public interface GymClassRepository extends JpaRepository<GymClass, Long> {

    List<GymClass> findAllByOrderByStartTimeDesc();

    // Jadwal kelas berdasarkan trainer
    List<GymClass> findByTrainerIdOrderByStartTimeAsc(Long trainerId);
}