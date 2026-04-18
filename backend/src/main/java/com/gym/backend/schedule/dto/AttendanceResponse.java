package com.gym.backend.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AttendanceResponse {
    private Long id;
    private String memberName;
    private String memberEmail;
    private String className;
    private LocalDateTime attendedAt;
}