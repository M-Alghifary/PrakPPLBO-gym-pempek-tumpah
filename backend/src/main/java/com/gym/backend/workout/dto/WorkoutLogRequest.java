package com.gym.backend.workout.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;

@Getter
public class WorkoutLogRequest {

    @NotNull(message = "Tanggal workout tidak boleh kosong")
    @PastOrPresent(message = "Tanggal workout tidak boleh di masa depan")
    private LocalDate workoutDate;

    @NotBlank(message = "Nama exercise tidak boleh kosong")
    private String exerciseName;

    private Double weightKg;
    private Integer sets;
    private Integer reps;
    private Integer durationMinutes;
    private String notes;
}