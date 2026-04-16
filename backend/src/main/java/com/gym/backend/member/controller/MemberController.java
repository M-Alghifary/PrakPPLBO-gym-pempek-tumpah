package com.gym.backend.member.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gym.backend.common.response.ApiResponse;
import com.gym.backend.member.dto.MemberRequest;
import com.gym.backend.member.dto.MemberResponse;
import com.gym.backend.member.service.MemberService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/profile")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<MemberResponse>> createProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MemberRequest request) {

        MemberResponse response = memberService.createProfile(
                userDetails.getUsername(), request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profil berhasil dibuat", response));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<MemberResponse>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        MemberResponse response = memberService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Berhasil mengambil profil", response));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<MemberResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MemberRequest request) {

        MemberResponse response = memberService.updateProfile(
                userDetails.getUsername(), request);

        return ResponseEntity.ok(ApiResponse.success("Profil berhasil diupdate", response));
    }
}