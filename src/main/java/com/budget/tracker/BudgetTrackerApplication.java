package com.budget.tracker;

import com.budget.tracker.model.Transaction;
import com.budget.tracker.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;

@SpringBootApplication
public class BudgetTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(BudgetTrackerApplication.class, args);
    }

    // Seed initial demo data on startup if database is empty
    @Bean
    CommandLineRunner initDatabase(TransactionRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                String today = LocalDate.now().toString();
                repository.save(new Transaction("Salary", 3500.0, "income", "Salary", today));
                repository.save(new Transaction("House Rent", 1200.0, "expense", "Housing", today));
                repository.save(new Transaction("Groceries", 150.0, "expense", "Food", today));
                System.out.println(">>> Sample transactions initialized in H2 Database.");
            }
        };
    }
}
