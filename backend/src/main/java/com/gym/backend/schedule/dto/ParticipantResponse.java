package com.gym.backend.schedule.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ParticipantResponse {
    private Long bookingId;
    private Long userId;
    private String memberName;
    private String memberEmail;
    private String status;
    private LocalDateTime bookedAt;
}