package com.gym.backend.member.service;

import org.springframework.stereotype.Service;

import com.gym.backend.auth.model.User;
import com.gym.backend.auth.repository.UserRepository;
import com.gym.backend.common.exception.BadRequestException;
import com.gym.backend.common.exception.ResourceNotFoundException;
import com.gym.backend.common.util.BmiCalculator;
import com.gym.backend.member.dto.MemberRequest;
import com.gym.backend.member.dto.MemberResponse;
import com.gym.backend.member.model.Member;
import com.gym.backend.member.repository.MemberRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final UserRepository userRepository;

    public MemberResponse createProfile(String email, MemberRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (memberRepository.existsByUserId(user.getId())) {
            throw new BadRequestException("Profil member sudah ada");
        }

        Member member = Member.builder()
                .user(user)
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .height(request.getHeight())
                .weight(request.getWeight())
                .fitnessGoal(request.getFitnessGoal())
                .profilePhotoUrl(request.getProfilePhotoUrl())
                .build();

        memberRepository.save(member);
        return toResponse(member);
    }

    public MemberResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Member member = memberRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil member belum dibuat"));

        return toResponse(member);
    }

    public MemberResponse updateProfile(String email, MemberRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Member member = memberRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profil member belum dibuat"));

        if (request.getPhoneNumber()   != null) member.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth()   != null) member.setDateOfBirth(request.getDateOfBirth());
        if (request.getHeight()        != null) member.setHeight(request.getHeight());
        if (request.getWeight()        != null) member.setWeight(request.getWeight());
        if (request.getFitnessGoal()   != null) member.setFitnessGoal(request.getFitnessGoal());
        if (request.getProfilePhotoUrl() != null) member.setProfilePhotoUrl(request.getProfilePhotoUrl());

        memberRepository.save(member);
        return toResponse(member);
    }

    private MemberResponse toResponse(Member member) {
        Double bmi = BmiCalculator.calculate(member.getWeight(), member.getHeight());

        return MemberResponse.builder()
                .id(member.getId())
                .userId(member.getUser().getId())
                .name(member.getUser().getName())
                .email(member.getUser().getEmail())
                .phoneNumber(member.getPhoneNumber())
                .dateOfBirth(member.getDateOfBirth())
                .height(member.getHeight())
                .weight(member.getWeight())
                .bmi(bmi)
                .bmiCategory(BmiCalculator.getCategory(bmi))
                .fitnessGoal(member.getFitnessGoal())
                .profilePhotoUrl(member.getProfilePhotoUrl())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}