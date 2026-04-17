package com.gym.backend.schedule.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gym.backend.common.response.ApiResponse;
import com.gym.backend.schedule.dto.ClassBookingResponse;
import com.gym.backend.schedule.dto.GymClassRequest;
import com.gym.backend.schedule.dto.GymClassResponse;
import com.gym.backend.schedule.service.ScheduleService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // Admin buat kelas baru
    @PostMapping("/classes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GymClassResponse>> createClass(
            @Valid @RequestBody GymClassRequest request) {

        GymClassResponse response = scheduleService.createClass(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kelas berhasil dibuat", response));
    }

    // Semua user bisa lihat jadwal
    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<GymClassResponse>>> getUpcomingClasses() {
        List<GymClassResponse> classes = scheduleService.getUpcomingClasses();
        return ResponseEntity.ok(ApiResponse.success("Jadwal kelas", classes));
    }

    // Member booking kelas
    @PostMapping("/classes/{classId}/book")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<ClassBookingResponse>> bookClass(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long classId) {

        ClassBookingResponse response =
                scheduleService.bookClass(userDetails.getUsername(), classId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking berhasil", response));
    }

    // Member cancel booking
    @PutMapping("/classes/{classId}/cancel")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<ClassBookingResponse>> cancelBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long classId) {

        ClassBookingResponse response =
                scheduleService.cancelBooking(userDetails.getUsername(), classId);
        return ResponseEntity.ok(ApiResponse.success("Booking dibatalkan", response));
    }

    // Member lihat booking miliknya
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<ApiResponse<List<ClassBookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<ClassBookingResponse> bookings =
                scheduleService.getMyBookings(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Daftar booking saya", bookings));
    }
}