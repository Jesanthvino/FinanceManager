package com.financeapp.service;

import com.financeapp.model.Expense;
import com.financeapp.repository.ExpenseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public Expense saveExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public List<Expense> getExpensesByUser(Long userId) {
        return expenseRepository.findByUserId(userId);
    }

    public List<Expense> getExpensesByDate(Long userId, LocalDate date) {
        return expenseRepository.findByUserIdAndDate(userId, date);
    }

    public void deleteExpense(Long id) {
    expenseRepository.deleteById(id);
    }

    public Expense updateExpense(Long id, Map<String, Object> request) {
    Expense expense = expenseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

    expense.setAmount(Double.valueOf(request.get("amount").toString()));
    expense.setCategory(request.get("category").toString());
    expense.setDescription(request.get("description").toString());
    expense.setDate(LocalDate.parse(request.get("date").toString()));

    return expenseRepository.save(expense);
}

}
