package com.gym.backend.membership.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MemberMembershipResponse {
    private Long id;
    private String packageName;
    private BigDecimal packagePrice;
    private Integer durationDays;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Long daysRemaining;
    private LocalDateTime createdAt;
}