package com.gym.backend.schedule.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ClassBookingResponse {
    private Long bookingId;
    private Long classId;
    private String className;
    private String trainerName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime bookedAt;
}