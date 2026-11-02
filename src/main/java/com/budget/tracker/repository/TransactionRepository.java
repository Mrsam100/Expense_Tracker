package com.budget.tracker.repository;

import com.budget.tracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Return transactions newest first
    List<Transaction> findAllByOrderByIdDesc();
}
