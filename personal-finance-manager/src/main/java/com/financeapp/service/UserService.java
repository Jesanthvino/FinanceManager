package com.financeapp.service;

import com.financeapp.model.User;
import com.financeapp.repository.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        System.out.println("Password received: " + user.getPassword());
        return userRepository.save(user);
    }
    
    public void deleteAllUsers() {
        userRepository.deleteAll();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
