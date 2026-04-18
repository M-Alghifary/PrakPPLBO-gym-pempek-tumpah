package com.gym.backend.schedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class QrCodeResponse {
    private Long classId;
    private String className;
    private String qrCodeBase64;  // image PNG dalam format base64
    private String qrToken;       // token yang di-encode dalam QR
}