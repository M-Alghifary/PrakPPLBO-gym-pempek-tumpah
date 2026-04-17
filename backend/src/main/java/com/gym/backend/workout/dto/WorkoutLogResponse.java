package com.gym.backend.workout.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class WorkoutLogResponse {
    private Long id;
    private LocalDate workoutDate;
    private String exerciseName;
    private Double weightKg;
    private Integer sets;
    private Integer reps;
    private Integer durationMinutes;
    private String notes;
    private LocalDateTime createdAt;
}