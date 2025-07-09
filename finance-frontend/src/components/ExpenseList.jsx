import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import AddExpense from "./AddExpense";
import CustomPopup from "./CustomPopup";
import categories from '../data/categories';
import '../styles.css';

// Function to generate consistent colors for categories
const getColorForCategory = (category) => {
  // Simple hash function to generate a color based on the category name
  const hash = Array.from(category).reduce(
    (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash), 0
  );
  
  // Generate a hue value between 0 and 360
  const hue = Math.abs(hash % 360);
  
  // Use HSL to ensure good saturation and lightness
  return `hsl(${hue}, 70%, 50%)`;
};

// Function to export expenses to CSV
const exportToCSV = (expenses, showPopupFn) => {
  if (expenses.length === 0) {
    showPopupFn("No expenses to export", "warning", "top-right", 3000);
    return;
  }
  
  // CSV header
  const headers = ["Amount", "Category", "Description", "Date"];
  
  // Convert expenses to CSV rows
  const rows = expenses.map(expense => [
    expense.amount,
    expense.category,
    `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes in description
    expense.date
  ]);
  
  // Combine header and rows
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ExpenseList = ({ expenses, setExpenses, onDelete, onRefresh }) => {
  // Popup state
  const [popup, setPopup] = useState({
    show: false,
    message: '',
    type: 'info',
    position: 'bottom-right',
    autoCloseTime: 3000
  });
  
  // Delete confirmation popup state
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    expenseId: null,
    expenseName: ''
  });
  
  // Update confirmation popup state
  const [updateConfirmation, setUpdateConfirmation] = useState({
    show: false,
    message: ''
  });
  
  // Reset filters confirmation popup state
  const [resetConfirmation, setResetConfirmation] = useState({
    show: false
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
  
  // Helper function to show delete confirmation
  const showDeleteConfirmation = (id, description) => {
    setDeleteConfirmation({
      show: true,
      expenseId: id,
      expenseName: description || 'this expense'
    });
  };
  
  // Helper function to close delete confirmation
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({
      show: false,
      expenseId: null,
      expenseName: ''
    });
  };
  
  // Helper function to show update confirmation
  const showUpdateConfirmation = (message) => {
    setUpdateConfirmation({
      show: true,
      message
    });
  };
  
  // Helper function to close update confirmation
  const closeUpdateConfirmation = () => {
    setUpdateConfirmation({
      show: false,
      message: ''
    });
  };
  
  // Helper function to show reset filters confirmation
  const showResetConfirmation = () => {
    setResetConfirmation({
      show: true
    });
  };
  
  // Helper function to close reset filters confirmation
  const closeResetConfirmation = () => {
    setResetConfirmation({
      show: false
    });
  };
  
  // Helper function to reset filters to default
  const resetFiltersToDefault = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDateRangeStart(getFirstDayOfCurrentMonth());
    setDateRangeEnd(getLastDayOfCurrentMonth());
    setSortBy("date");
    setSortOrder("desc");
    closeResetConfirmation();
  };
  
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/expenses/${id}`);
      onDelete(id);
      
      // Show success popup
      showPopup("Expense deleted successfully!", "success", "bottom-right", 3000);
      closeDeleteConfirmation();
    } catch (error) {
      console.error("❌ Error deleting expense:", error);
      
      // Show error popup
      showPopup("Failed to delete expense. Please try again.", "error", "bottom-right", 5000);
      closeDeleteConfirmation();
    }
  };

  const [editingExpense, setEditingExpense] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [swipingId, setSwipingId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Touch event handlers for swipe-to-delete on mobile
  const handleTouchStart = (e, id) => {
    setSwipingId(id);
    const touchStartX = e.touches[0].clientX;
    e.currentTarget.dataset.touchStartX = touchStartX;
  };
  
  const handleTouchMove = (e) => {
    if (!e.currentTarget.dataset.touchStartX) return;
    
    const touchStartX = parseInt(e.currentTarget.dataset.touchStartX);
    const currentTouchX = e.touches[0].clientX;
    const diff = currentTouchX - touchStartX;
    
    // Only allow swiping left (negative diff)
    if (diff < 0) {
      // Limit the swipe to -150px
      const swipeAmount = Math.max(diff, -150);
      e.currentTarget.style.transform = `translateX(${swipeAmount}px)`;
      
      // Show delete button as we swipe
      const deleteButton = e.currentTarget.querySelector('.swipe-delete-button');
      if (deleteButton) {
        deleteButton.style.opacity = Math.min(Math.abs(swipeAmount) / 100, 1);
      }
    }
  };
  
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Add scroll event listener to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleTouchEnd = (e, id) => {
    if (!e.currentTarget.dataset.touchStartX) return;
    
    const touchStartX = parseInt(e.currentTarget.dataset.touchStartX);
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;
    
    // If swiped more than 100px to the left, show delete confirmation
    if (diff < -100) {
      const expense = expenses.find(exp => exp.id === id);
      showDeleteConfirmation(id, expense?.description);
    }
    
    // Reset position with animation
    e.currentTarget.style.transition = 'transform 0.3s ease';
    e.currentTarget.style.transform = 'translateX(0)';
    
    // Hide delete button
    const deleteButton = e.currentTarget.querySelector('.swipe-delete-button');
    if (deleteButton) {
      deleteButton.style.opacity = 0;
    }
    
    // Clear touch data
    setTimeout(() => {
      e.currentTarget.style.transition = '';
      delete e.currentTarget.dataset.touchStartX;
      setSwipingId(null);
    }, 300);
  };

  // Helper function to get first day of current month in YYYY-MM-DD format
  const getFirstDayOfCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  };
  
  // Helper function to get last day of current month in YYYY-MM-DD format
  const getLastDayOfCurrentMonth = () => {
    const now = new Date();
    // Create a date for the first day of the next month, then subtract one day
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRangeStart, setDateRangeStart] = useState(getFirstDayOfCurrentMonth());
  const [dateRangeEnd, setDateRangeEnd] = useState(getLastDayOfCurrentMonth());
  const [sortBy, setSortBy] = useState("date"); // Default to sort by date
  const [sortOrder, setSortOrder] = useState("desc"); // Default to newest first
  
  // Filter expenses based on current filters
  const filteredExpenses = expenses.filter(exp => {
    // Text search filter
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === "" || exp.category === categoryFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRangeStart) {
      matchesDateRange = matchesDateRange && exp.date >= dateRangeStart;
    }
    if (dateRangeEnd) {
      matchesDateRange = matchesDateRange && exp.date <= dateRangeEnd;
    }
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });
  
  // Calculate expense summary
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  
  // Get category totals
  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(expense.amount);
    return acc;
  }, {});


  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
      {/* Custom Popup Component */}
      <CustomPopup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        position={popup.position}
        autoCloseTime={popup.autoCloseTime}
        onClose={closePopup}
      />
      
      {/* Delete Confirmation Popup */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Expense</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this expense?
                {deleteConfirmation.expenseName && (
                  <span className="block font-medium mt-1">"{deleteConfirmation.expenseName}"</span>
                )}
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeDeleteConfirmation}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmation.expenseId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Update Confirmation Popup */}
      {updateConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Updated</h3>
              <p className="text-sm text-gray-500">
                {updateConfirmation.message || "Your expense has been updated successfully!"}
              </p>
            </div>
            <div className="flex justify-center">
              <button
                onClick={closeUpdateConfirmation}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reset Filters Confirmation Popup */}
      {resetConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reset Filters</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to reset all filters to default settings? This will:
                <ul className="mt-2 text-left list-disc pl-5">
                  <li>Clear search text and category filter</li>
                  <li>Set date range to current month</li>
                  <li>Sort by date (newest first)</li>
                </ul>
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeResetConfirmation}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetFiltersToDefault}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Expense Manager</h2>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Filter & Sort</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="dateStart" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range (Start)
              {dateRangeStart && dateRangeEnd && 
               (dateRangeStart !== getFirstDayOfCurrentMonth() || 
                dateRangeEnd !== getLastDayOfCurrentMonth()) && 
               (dateRangeStart !== "" || dateRangeEnd !== "") && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                  Custom
                </span>
              )}
            </label>
            <input
              id="dateStart"
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="dateEnd" className="block text-sm font-medium text-gray-700 mb-1">Date Range (End)</label>
            <input
              id="dateEnd"
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setSortOrder("asc");
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>Select field</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => exportToCSV(filteredExpenses, showPopup)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center"
            disabled={filteredExpenses.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to CSV
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => {
                // Set date range to empty (all time)
                setDateRangeStart("");
                setDateRangeEnd("");
                // Keep other filters as they are
              }}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors flex items-center ${
                dateRangeStart === "" && dateRangeEnd === "" 
                  ? "bg-indigo-600 text-white font-medium" 
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
              title="Show all expenses regardless of date"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              All Time
            </button>
            
            <button
              onClick={() => {
                // Set date range to current month
                setDateRangeStart(getFirstDayOfCurrentMonth());
                setDateRangeEnd(getLastDayOfCurrentMonth());
                // Keep other filters as they are
              }}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center ${
                dateRangeStart === getFirstDayOfCurrentMonth() && dateRangeEnd === getLastDayOfCurrentMonth() 
                  ? "bg-green-600 text-white font-medium" 
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
              title="Show only current month expenses"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Current Month
            </button>
            
            <button
              onClick={() => {
                // Only show confirmation if filters are actually set
                const hasCustomFilters = searchTerm || categoryFilter || 
                  dateRangeStart !== getFirstDayOfCurrentMonth() || 
                  dateRangeEnd !== getLastDayOfCurrentMonth() || 
                  sortBy !== "date" || sortOrder !== "desc";
                
                if (!hasCustomFilters) {
                  // If no custom filters are set, just reset without confirmation
                  resetFiltersToDefault();
                } else {
                  // Show custom confirmation popup
                  showResetConfirmation();
                }
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">All Expenses</h3>
            {filteredExpenses.length !== expenses.length && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
            )}
          </div>
          <button 
            onClick={onRefresh}
            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {expenses.length === 0 ? 
              "No expenses found. Add some expenses to get started." : 
              "No expenses match your current filters. Try adjusting your search criteria."
            }
          </div>
        ) : (
          <>
            {/* Mobile swipe hint - only visible on small screens */}
            <div className="md:hidden text-xs text-gray-500 mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              Swipe left on an expense to delete
            </div>
          <div className="grid grid-cols-1 lg:grid-cols-auto xl:grid-cols-auto 2xl:grid-cols-auto gap-4 p-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filteredExpenses
              .sort((a, b) => {
                if (sortBy === "") return 0;
                
                let valA, valB;
                
                if (sortBy === "amount") {
                  valA = parseFloat(a.amount);
                  valB = parseFloat(b.amount);
                } else if (sortBy === "date") {
                  valA = new Date(a.date);
                  valB = new Date(b.date);
                } else if (sortBy === "category") {
                  valA = a.category;
                  valB = b.category;
                  return sortOrder === "asc" 
                    ? valA.localeCompare(valB) 
                    : valB.localeCompare(valA);
                }
                
                return sortOrder === "asc" ? valA - valB : valB - valA;
              })
              .map(expense => (
                <div 
                  key={expense.id} 
                  className={`hover:bg-gray-50 transition-colors rounded-lg border shadow-sm ${
                    swipingId === expense.id 
                      ? 'border-red-200 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow'
                  } cursor-pointer relative overflow-hidden h-full min-h-[200px] min-w-[280px] flex flex-col`}
                  onTouchStart={(e) => handleTouchStart(e, expense.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={(e) => handleTouchEnd(e, expense.id)}
                >
                  {/* Swipe delete button (hidden by default) */}
                  <div className="swipe-delete-button absolute right-0 top-0 bottom-0 bg-red-500 text-white flex items-center justify-center w-20 opacity-0 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  
                  <div className="flex flex-col h-full p-6">
                    {/* Header with amount and date */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl font-medium text-gray-900">₹{expense.amount}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {/* Category */}
                    <div className="mb-3">
                      <span 
                        className="inline-block px-2 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${getColorForCategory(expense.category)}20`,
                          color: getColorForCategory(expense.category)
                        }}
                      >
                        {expense.category}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <div 
                      className="flex-grow mb-3 cursor-pointer"
                      onClick={() => {
                        setEditingExpense(expense);
                        setShowModal(true);
                      }}
                    >
                      {expense.description ? (
                        <p className="text-sm text-gray-600 break-words">
                          {expense.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          No description
                        </p>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex justify-end space-x-2 mt-auto pt-2 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingExpense(expense);
                          setShowModal(true);
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
                        title="Edit expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmation(expense.id, expense.description);
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center w-full justify-center"
                        title="Delete expense"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
          </>
        )}
      </div>

      {/* Expense Summary */}
      {expenses.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Expense Summary</h3>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">Total Expenses:</span>
              <span className="text-xl font-bold text-gray-900">₹{totalExpenses.toFixed(2)}</span>
            </div>
            
            <div className="h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-700">Category Breakdown:</h4>
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ 
                    backgroundColor: getColorForCategory(category) 
                  }}></span>
                  <span className="text-gray-700">{category}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-900 font-medium">₹{amount.toFixed(2)}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({((amount / totalExpenses) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 bg-gray-700 hover:bg-gray-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors z-10"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
      
      {/* Edit Expense Modal */}
      {showModal && editingExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Edit Expense</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingExpense(null);
                }}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <AddExpense
                existingExpense={editingExpense}
                onExpenseUpdated={(updatedExpense) => {
                  setExpenses(expenses.map(exp =>
                    exp.id === updatedExpense.id ? updatedExpense : exp
                  ));
                  setShowModal(false);
                  setEditingExpense(null);
                  
                  // Show update confirmation popup
                  showUpdateConfirmation(`Expense "${updatedExpense.description || 'with no description'}" has been updated successfully!`);
                }}
              />
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors mr-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ExpenseList;
