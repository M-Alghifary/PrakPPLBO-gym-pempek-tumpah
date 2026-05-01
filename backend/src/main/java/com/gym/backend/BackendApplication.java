package com.gym.backend;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.gym.backend.membership.model.MembershipPackage;
import com.gym.backend.membership.repository.MembershipPackageRepository;
import com.gym.backend.schedule.model.GymClass;
import com.gym.backend.schedule.repository.GymClassRepository;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner loadMembershipPackages(MembershipPackageRepository repository) {
		return args -> {
			if (repository.count() == 0) {
				repository.save(MembershipPackage.builder()
					.name("Membership 1 Bulan")
					.description("Akses penuh gym selama 30 hari, cocok untuk pemula.")
					.price(new BigDecimal("150000"))
					.durationDays(30)
					.isActive(true)
					.build());

				repository.save(MembershipPackage.builder()
					.name("Membership 3 Bulan")
					.description("Paket hemat 90 hari dengan harga terbaik.")
					.price(new BigDecimal("420000"))
					.durationDays(90)
					.isActive(true)
					.build());

				repository.save(MembershipPackage.builder()
					.name("Membership 12 Bulan")
					.description("Langganan tahunan untuk hasil jangka panjang.")
					.price(new BigDecimal("1500000"))
					.durationDays(365)
					.isActive(true)
					.build());
			}
		};
	}

    @Bean
    public CommandLineRunner loadGymClasses(GymClassRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(GymClass.builder()
                        .name("Yoga Pagi")
                        .description("Stretching lembut untuk memulai hari dengan energi.")
                        .trainer(null) // Will be assigned later or through admin
                        .startTime(LocalDateTime.now().plusDays(1).withHour(7).withMinute(0))
                        .endTime(LocalDateTime.now().plusDays(1).withHour(8).withMinute(0))
                        .maxCapacity(15)
                        .build());

                repository.save(GymClass.builder()
                        .name("HIIT Express")
                        .description("Latihan intens 30 menit untuk membakar kalori.")
                        .trainer(null)
                        .startTime(LocalDateTime.now().plusDays(2).withHour(18).withMinute(30))
                        .endTime(LocalDateTime.now().plusDays(2).withHour(19).withMinute(15))
                        .maxCapacity(12)
                        .build());

                repository.save(GymClass.builder()
                        .name("Strength Training")
                        .description("Fokus pada otot inti dan kekuatan seluruh tubuh.")
                        .trainer(null)
                        .startTime(LocalDateTime.now().plusDays(3).withHour(16).withMinute(0))
                        .endTime(LocalDateTime.now().plusDays(3).withHour(17).withMinute(0))
                        .maxCapacity(10)
                        .build());
            }
        };
    }
}

