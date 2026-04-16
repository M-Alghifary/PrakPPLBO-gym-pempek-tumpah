package com.gym.backend.membership.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gym.backend.common.response.ApiResponse;
import com.gym.backend.membership.dto.MemberMembershipResponse;
import com.gym.backend.membership.dto.MembershipPackageResponse;
import com.gym.backend.membership.service.MembershipService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;

    // Publik — semua orang bisa lihat paket
    @GetMapping("/packages")
    public ResponseEntity<ApiResponse<List<MembershipPackageResponse>>> getPackages() {
        List<MembershipPackageResponse> packages =
                membershipService.getAllActivePackages();
        return ResponseEntity.ok(
                ApiResponse.success("Daftar paket membership", packages));
    }

    // Member subscribe ke paket
    @PostMapping("/subscribe/{packageId}")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<MemberMembershipResponse>> subscribe(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long packageId) {

        MemberMembershipResponse response =
                membershipService.subscribe(userDetails.getUsername(), packageId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Membership berhasil diaktifkan", response));
    }

    // Cek membership aktif
    @GetMapping("/active")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<MemberMembershipResponse>> getActive(
            @AuthenticationPrincipal UserDetails userDetails) {

        MemberMembershipResponse response =
                membershipService.getActiveMembership(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Membership aktif", response));
    }

    // Riwayat membership
    @GetMapping("/history")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<MemberMembershipResponse>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<MemberMembershipResponse> history =
                membershipService.getMembershipHistory(userDetails.getUsername());
        return ResponseEntity.ok(
                ApiResponse.success("Riwayat membership", history));
    }
}