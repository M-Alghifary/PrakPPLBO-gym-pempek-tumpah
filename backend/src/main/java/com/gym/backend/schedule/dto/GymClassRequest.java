package com.gym.backend.schedule.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class GymClassRequest {

    @NotBlank(message = "Nama kelas tidak boleh kosong")
    private String name;

    private String description;

    private Long trainerId;

    @NotNull(message = "Waktu mulai tidak boleh kosong")
    @Future(message = "Waktu mulai harus di masa depan")
    private LocalDateTime startTime;

    @NotNull(message = "Waktu selesai tidak boleh kosong")
    private LocalDateTime endTime;

    @NotNull(message = "Kapasitas tidak boleh kosong")
    @Min(value = 1, message = "Kapasitas minimal 1")
    private Integer maxCapacity;
}