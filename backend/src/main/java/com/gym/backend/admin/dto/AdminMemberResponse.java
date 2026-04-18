package com.gym.backend.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AdminMemberResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private Boolean hasMembership;
    private String membershipStatus;
    private LocalDateTime joinedAt;
}