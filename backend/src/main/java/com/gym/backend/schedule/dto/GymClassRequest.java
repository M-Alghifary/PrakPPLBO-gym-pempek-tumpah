package com.gym.backend.schedule.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GymClassRequest {

    @NotBlank(message = "Nama kelas tidak boleh kosong")
    private String name;

    private String description;

    private Long trainerId;

    @NotNull(message = "Waktu mulai tidak boleh kosong")
    @Future(message = "Waktu mulai harus di masa depan")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime startTime;

    @NotNull(message = "Waktu selesai tidak boleh kosong")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime endTime;

    @NotNull(message = "Kapasitas tidak boleh kosong")
    @Min(value = 1, message = "Kapasitas minimal 1")
    private Integer maxCapacity;
}