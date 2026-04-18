package com.gym.backend.admin.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ReportResponse {
    private Long totalMembers;
    private Long activeMembers;
    private Long totalClasses;
    private Long totalBookings;
    private BigDecimal totalRevenue;
    private String mostPopularClass;
}