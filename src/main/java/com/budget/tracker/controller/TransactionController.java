package com.budget.tracker.controller;

import com.budget.tracker.model.Transaction;
import com.budget.tracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // Allows API calls from any port / frontend
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @Autowired
    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // 1. GET all transactions
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByIdDesc();
    }

    // 2. POST create a new transaction
    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction) {
        if (transaction.getTitle() == null || transaction.getTitle().trim().isEmpty()
                || transaction.getAmount() == null
                || transaction.getType() == null
                || transaction.getCategory() == null) {
            return ResponseEntity.badRequest().body("Please provide title, amount, type, and category.");
        }

        Transaction saved = transactionRepository.save(transaction);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // 3. DELETE single transaction by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id) {
        Optional<Transaction> existing = transactionRepository.findById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
        }

        transactionRepository.deleteById(id);
        return ResponseEntity.ok().body("Transaction deleted successfully");
    }

    // 4. DELETE all transactions (Reset)
    @DeleteMapping
    public ResponseEntity<?> resetAllTransactions() {
        transactionRepository.deleteAll();
        return ResponseEntity.ok().body("All transactions cleared successfully");
    }
}
