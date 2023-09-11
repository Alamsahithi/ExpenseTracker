let currentPage = 1;
let lastPage = 1;

const expensesPerPageSelect = document.getElementById("expensesPerPage");
expensesPerPageSelect.value = localStorage.getItem("expensesPerPage")
  ? localStorage.getItem("expensesPerPage")
  : 5;
let expensesPerPage = parseInt(expensesPerPageSelect.value);
expensesPerPageSelect.addEventListener(
  "change",
  function handleExpensesPerPageChange() {
    expensesPerPage = parseInt(expensesPerPageSelect.value);
    localStorage.setItem("expensesPerPage", expensesPerPage);
    fetchExpenses();
  }
);
const firstPageBtn = document.getElementById("firstPage");
const previousPageBtn = document.getElementById("previousPage");
const nextPageBtn = document.getElementById("nextPage");
const lastPageBtn = document.getElementById("lastPage");

firstPageBtn.addEventListener("click", () => {
  currentPage = 1;
  fetchExpenses();
});
previousPageBtn.addEventListener("click", () => {
  if (currentPage > 1) currentPage--;
  fetchExpenses();
});
nextPageBtn.addEventListener("click", () => {
  if (currentPage < lastPage) currentPage++;
  fetchExpenses();
});
lastPageBtn.addEventListener("click", () => {
  currentPage = lastPage;
  fetchExpenses();
});

function updatePaginationButtons() {
  firstPageBtn.disabled = currentPage <= 1;
  previousPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage === lastPage;
  lastPageBtn.disabled = currentPage === lastPage;
}

const downloadExpensesButton = document
  .getElementById("downloadExpenses")
  .addEventListener("click", function download() {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(
        `http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/user/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Failed to retrieve expenses");
          }
        })
        .then((response) => {
          if (response?.message) {
            alert(response?.message);
          } else {
            alert("Expenses downloaded successfully");
            var a = document.createElement("a");
            a.href = response?.fileUrl;
            a.download = "myexpenses.csv";
            a.click();
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert(error.message);
        });
    } else {
      alert("User details not found. Please log in again.");
      window.location.href("/login");
    }
  });

const logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function handleLogout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/login";
});

function updatePremiumStatus(isPremiumUser) {
  const premiumStatusElement = document.getElementById("premiumStatus");
  const buyPremium = document.getElementById("buyPremium");
  const showLeaderBoardButton = document.getElementById("showLeaderBoard");
  const downloadBtn = document.getElementById("downloadExpenses");

  if (isPremiumUser) {
    premiumStatusElement.textContent = "You are a premium user.";
    buyPremium.style.display = "none"; // Hide the buy premium button
    showLeaderBoardButton.style.display = "block";
    downloadBtn.style.display = "block";
  } else {
    premiumStatusElement.textContent = "";
    buyPremium.style.display = "block"; // Show the buy premium button
  }
}

function fetchUserProfileAndUpdateUI() {
  const token = localStorage.getItem("token");
  if (token) {
    fetch(
      "http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/user/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to retrieve user profile");
        }
      })
      .then((userProfile) => {
        const isPremiumUser = userProfile.premiumUser === true;
        updatePremiumStatus(isPremiumUser);
        localStorage.setItem("userDetails", JSON.stringify(userProfile));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert("User details not found. Please log in again.");
    fetch("/login");
  }
}

function displayLeaderBoardTable(leaderboard) {
  const table = document.getElementById("leaderBoardTable");
  const tableBody = document.getElementById("leaderBoardBody");
  tableBody.innerHTML = "";
  leaderboard.forEach((userTotalExpense) => {
    const { totalExpenses, fullName } = userTotalExpense;
    const row = tableBody.insertRow();
    const usernameCell = row.insertCell();
    usernameCell.textContent = fullName;
    const totalExpensesCell = row.insertCell();
    totalExpensesCell.textContent = totalExpenses;
  });
  table.style.display = "block";
}

const showLeaderBoard = document.getElementById("showLeaderBoard");
showLeaderBoard.addEventListener("click", function fetchLeaderBoard(event) {
  const token = localStorage.getItem("token");
  if (token) {
    fetch(
      "http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/premium/leaderboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to retrieve leader borad");
        }
      })
      .then((leaderboard) => {
        displayLeaderBoardTable(leaderboard);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert("User details not found. Please log in again.");
    window.location.href("/login");
  }
});

const buyPremium = document.getElementById("buyPremium");
buyPremium.addEventListener("click", function createOrder(event) {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const userId = userDetails ? userDetails.id : null;
  const token = localStorage.getItem("token");
  if (token) {
    const order_id = `${userId}_${Date.now()}`;
    const orderData = {
      order_id: order_id,
      amount: 100,
      currency: "INR",
    };
    fetch(
      "http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/payment/create-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to create order");
        }
      })
      .then((response) => {
        let { razorpay_order_id } = response;
        var options = {
          key: "rzp_test_xTWOlTYejN2Ols",
          order_id: razorpay_order_id,
          handler: async (response) => {
            fetch(
              "http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/payment/update-order",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response?.razorpay_order_id,
                  status: "SUCCESS",
                }),
              }
            );
            alert("Payment Successfull");
            fetchUserProfileAndUpdateUI();
          },
        };
        var rzp1 = new Razorpay(options);
        rzp1.open();
        rzp1.on("payment.failed", function (response) {
          fetch(
            "http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/payment/update-order",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response?.order_id,
                status: "FAILED",
              }),
            }
          );
          alert("Payment failed");
          fetchUserProfileAndUpdateUI();
        });
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    alert("User details not found. Please log in again.");
    window.location.href = "/login";
  }
});

function renderExpenseList(expenses) {
  const expenseList = document.getElementById("expenseList");
  expenseList.innerHTML = "";
  expenses.forEach((expense) => {
    const listItem = document.createElement("li");
    const expenseAmount = parseFloat(expense.amount);
    const expenseDetails = `Amount:${expenseAmount.toFixed(2)} | Category: ${
      expense.category
    } | Description: ${expense.description} | Date: ${new Date(
      expense.createdAt
    ).toLocaleDateString()}`;
    listItem.textContent = expenseDetails;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      deleteExpense(expense.id);
    });
    listItem.appendChild(deleteButton);
    expenseList.appendChild(listItem);
  });
}

function fetchExpenses() {
  const userDetails = JSON.parse(localStorage.getItem("userDetails"));
  const token = localStorage.getItem("token");

  if (token) {
    const url = `http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/expense/all-expenses?page=${currentPage}&size=${expensesPerPage}`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to retrieve expenses");
        }
      })
      .then((data) => {
        currentPage = data.current_page;
        lastPage = data.last_page;
        renderExpenseList(data.data);
        updatePaginationButtons();
      })
      .catch((error) => {
        console.log(error);
        alert(error.message);
      });
  } else {
    alert("User details not found. Please log in again.");
  }
}

function deleteExpense(expenseId) {
  console.log(expenseId);
  const token = localStorage.getItem("token");

  fetch(
    `http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/expense/delete-expense?expenseId=${expenseId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
    .then((response) => {
      if (response.ok) {
        alert("Expense deleted successfully!");
        fetchExpenses();
      } else {
        throw new Error("Failed to delete expense");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(error.message);
    });
}

document
  .getElementById("addExpenseForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const expense = {};

    for (let [key, value] of formData.entries()) {
      expense[key] = value;
    }

    const expenseAmount = parseFloat(expense.amount);

    if (!isNaN(expenseAmount)) {
      expense.amount = expenseAmount;

      const userDetails = JSON.parse(localStorage.getItem("userDetails"));
      const userId = userDetails ? userDetails.id : null;
      const token = localStorage.getItem("token");

      if (userId) {
        fetch(
          `http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/expense/add-expense`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(expense),
          }
        )
          .then((response) => {
            if (response.ok) {
              alert("Expense saved successfully!");
              form.reset();
              fetchExpenses();
            } else {
              throw new Error("Failed to save expense");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert(error.message);
          });
      } else {
        alert("User details not found. Please log in again.");
      }
    } else {
      alert("Invalid expense amount. Please enter a valid number.");
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  fetchUserProfileAndUpdateUI();
  fetchExpenses();
});
