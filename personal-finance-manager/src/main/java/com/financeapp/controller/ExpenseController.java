package com.financeapp.controller;

import com.financeapp.model.Expense;
import com.financeapp.model.User;
import com.financeapp.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    
    @PostMapping
    public ResponseEntity<Expense> addExpense(@RequestBody Map<String, Object> request) {
    System.out.println("Incoming request: " + request);
    Double amount = Double.valueOf(request.get("amount").toString());
    String category = request.get("category").toString();
    String description = request.get("description").toString();
    LocalDate date = LocalDate.parse(request.get("date").toString());
    Long userId = Long.valueOf(request.get("userId").toString());

    // Create a User object with only ID set
    User user = new User();
    user.setId(userId);

    // Create and save the expense
    Expense expense = Expense.builder()
            .amount(amount)
            .category(category)
            .description(description)
            .date(date)
            .user(user) // sets user with only ID populated
            .build();

    Expense saved = expenseService.saveExpense(expense);
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
}


    @GetMapping("/user/{userId}")
    public List<Expense> getAllExpenses(@PathVariable Long userId) {
        return expenseService.getExpensesByUser(userId);
    }

    @GetMapping("/user/{userId}/date/{date}")
    public List<Expense> getExpensesByDate(@PathVariable Long userId, @PathVariable String date) {
        return expenseService.getExpensesByDate(userId, LocalDate.parse(date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
    expenseService.deleteExpense(id);
    return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Map<String, Object> request) {
    Expense updated = expenseService.updateExpense(id, request);
    return ResponseEntity.ok(updated);
    }

    
}
