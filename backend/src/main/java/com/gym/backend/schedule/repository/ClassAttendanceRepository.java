package com.gym.backend.schedule.repository;

import com.gym.backend.schedule.model.ClassAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassAttendanceRepository extends JpaRepository<ClassAttendance, Long> {

    boolean existsByUserIdAndGymClassId(Long userId, Long gymClassId);

    List<ClassAttendance> findByGymClassId(Long gymClassId);

    List<ClassAttendance> findByUserIdOrderByAttendedAtDesc(Long userId);
}