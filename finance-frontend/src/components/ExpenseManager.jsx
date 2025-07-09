import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../api/axios";
import AddExpense from "./AddExpense";
import ExpenseList from "./ExpenseList";
import CustomPopup from "./CustomPopup";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import '../styles.css';

const ExpenseManager = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setError] = useState(null);
  const [showMobileForm, setShowMobileForm] = useState(false);
  
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

  const fetchExpenses = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/expenses/user/${currentUser.id}`);
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setError("Failed to load expenses. Please try again.");
      showPopup("Failed to load expenses. Please try again.", "error", "top-right", 0);
    } finally {
      setIsLoading(false);
    }
  },[currentUser]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]); // Re-fetch when currentUser changes

  const handleExpenseAdd = (newExpense) => {
    setExpenses(prev => [...prev, newExpense]);
    showPopup("Expense added successfully!", "success");
  };

  const handleExpenseDel = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    showPopup("Expense deleted successfully!", "info");
  };
  
  const handleRefresh = () => {
    fetchExpenses();
  };

  return (
    <div className="min-h-screen bg-green-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Personal Finance Manager</h1>
          <p className="text-gray-600 mt-2">Track, manage, and analyze your expenses</p>
          {currentUser && (
            <p className="text-blue-600 mt-2 font-medium">
              Welcome, {currentUser.name || currentUser.email}! Here are your expenses.
            </p>
          )}
        </header>
      
      {/* Custom Popup Component */}
      <CustomPopup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        position={popup.position}
        autoCloseTime={popup.autoCloseTime}
        onClose={closePopup}
      />
      
      {/* Main content - responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Expenses list - takes 8/12 of the screen on large devices, 9/12 on extra large */}
        <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading expenses...</p>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center items-center h-64">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium">{errorMessage}</p>
                <button 
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <ExpenseList 
              expenses={expenses} 
              setExpenses={setExpenses} 
              onDelete={handleExpenseDel}
              onRefresh={handleRefresh}
            />
          )}
        </div>
        
        {/* Add expense form - takes 4/12 of the screen on large devices, 3/12 on extra large */}
        <div className="bg-white rounded-lg shadow-sm p-6 order-1 lg:order-2 mb-8 lg:mb-0 sticky top-4 lg:col-span-4 xl:col-span-3 lg:self-start min-w-[350px]">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Expense</h2>
          <AddExpense 
            onExpenseAdded={handleExpenseAdd}
          />
          {/* Empty container for backward compatibility */}
          <div id="success-message-container"></div>
        </div>
      </div>
      
      {/* Mobile Add Expense Button (visible only on small screens) */}
      <div className="fixed bottom-6 right-6 lg:hidden z-10">
        <button
          onClick={() => setShowMobileForm(!showMobileForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          {showMobileForm ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Mobile Add Expense Form Modal */}
      {showMobileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden flex justify-center items-end">
          <div className="bg-white rounded-t-xl w-full max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Add New Expense</h3>
              <button 
                onClick={() => setShowMobileForm(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <AddExpense 
                onExpenseAdded={(newExpense) => {
                  handleExpenseAdd(newExpense);
                  setShowMobileForm(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default ExpenseManager;
