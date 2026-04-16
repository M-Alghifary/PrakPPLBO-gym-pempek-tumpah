package com.gym.backend.member.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;

@Getter
public class MemberRequest {

    private String phoneNumber;

    @PastOrPresent(message = "Tanggal lahir tidak valid")
    private LocalDate dateOfBirth;

    private Double height;
    private Double weight;
    private String fitnessGoal;
    private String profilePhotoUrl;
}