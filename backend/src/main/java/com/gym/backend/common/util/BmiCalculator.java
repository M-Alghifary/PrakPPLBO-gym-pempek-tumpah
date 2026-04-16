package com.gym.backend.common.util;

public class BmiCalculator {

    private BmiCalculator() {} // utility class, tidak perlu di-instantiate

    public static Double calculate(Double weightKg, Double heightCm) {
        if (weightKg == null || heightCm == null || heightCm == 0) return null;
        double heightM = heightCm / 100.0;
        double bmi = weightKg / (heightM * heightM);
        return Math.round(bmi * 10.0) / 10.0; // 1 desimal
    }

    public static String getCategory(Double bmi) {
        if (bmi == null) return null;
        if (bmi < 18.5) return "Berat Badan Kurang";
        if (bmi < 25.0) return "Normal";
        if (bmi < 30.0) return "Berat Badan Lebih";
        return "Obesitas";
    }
}