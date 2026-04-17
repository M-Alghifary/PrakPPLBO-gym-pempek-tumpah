package com.gym.backend.schedule.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GymClassResponse {
    private Long id;
    private String name;
    private String description;
    private String trainerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer maxCapacity;
    private Integer currentCapacity;
    private Integer remainingSlots;
    private String status;
}