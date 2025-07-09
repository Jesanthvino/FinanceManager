import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import categories from '../data/categories';
import CustomPopup from "./CustomPopup";
import { useAuth } from "../context/AuthContext";
import '../styles.css';

function AddExpense({ onExpenseAdded , existingExpense, onExpenseUpdated}) {
  const { currentUser } = useAuth();
  const [expense, setExpense] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });
  
  // Popup state
  const [popup, setPopup] = useState({
    show: false,
    message: '',
    type: 'info',
    position: 'bottom-right',
    autoCloseTime: 3000
  });
  
  // Helper function to show popups
  const showPopup = (message, type = 'info', position = 'bottom-right', autoCloseTime = 3000) => {
    setPopup({
      show: true,
      message,
      type,
      position,
      autoCloseTime
    });
  };

  // Helper function to close popup
  const closePopup = () => {
    setPopup(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
  if (existingExpense) {
    setExpense({
      amount: existingExpense.amount,
      category: existingExpense.category,
      description: existingExpense.description,
      date: existingExpense.date,
    });
  }
}, [existingExpense]);


  // Get userId from authenticated user
  const userId = currentUser?.id;

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!userId) {
      showPopup("You must be logged in to add expenses", "error", "top-right", 5000);
      return;
    }
    
    try {
      if (existingExpense) {
        const response = await axiosInstance.put(
          `/api/expenses/${existingExpense.id}`,
          { ...expense, userId }
        );
        showPopup("Expense updated successfully!", "success");
        onExpenseUpdated(response.data);
      } else {
        const newExpense = await axiosInstance.post(`/api/expenses`, {
          ...expense,
          userId,
        });
        showPopup("Expense added successfully!", "success");
        onExpenseAdded(newExpense.data);
      }
      setExpense({ amount: "", category: "", description: "", date: "" });
    } catch (err) {
      console.error("Error saving expense:", err);
      
      // Check if it's an authorization error
      if (err.response?.status === 401) {
        showPopup("Authorization error. Please log out and log in again.", "error", "top-right", 5000);
      } else {
        showPopup(`Failed to save expense: ${err.response?.data?.message || err.message}`, "error", "top-right", 5000);
      }
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 add-expense-form min-w-[280px]">
      {/* Custom Popup Component */}
      <CustomPopup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        position={popup.position}
        autoCloseTime={popup.autoCloseTime}
        onClose={closePopup}
      />
      <div className="grid grid-cols-1 gap-4 w-full">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹)
          </label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={expense.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={expense.category}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={expense.description}
          onChange={handleChange}
          placeholder="Enter description"
          rows="2"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-base"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          id="date"
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
        />
      </div>
      
      <button 
        type="submit"
        className={`w-full py-2 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center text-base ${
          existingExpense 
            ? "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500" 
            : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
        }`}
      >
        {existingExpense ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Update Expense
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Expense
          </>
        )}
      </button>
      
      {/* Success message container */}
      <div id="success-message-container"></div>
    </form>
  );
}

export default AddExpense;
