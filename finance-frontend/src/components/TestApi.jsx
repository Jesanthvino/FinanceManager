import { useEffect } from "react";
import axios from "../api/axios";

const TestApi = () => {
  useEffect(() => {
    axios.get("/api/expenses/user/1")
      .then(res => {
        console.log("✅ Expenses:", res.data);
      })
      .catch(err => {
        console.error("❌ API error:", err);
      });
  }, []);

  return <h2>Check the console for API response</h2>;
};

export default TestApi;
