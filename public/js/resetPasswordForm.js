document
        .getElementById("resetPasswordForm")
        .addEventListener("submit", async (event) => {
          console.log("hello")
          event.preventDefault();
          const formData = new FormData(event.target);
          const requestData = {};
          formData.forEach((value, key) => {
            requestData[key] = value;
          });

          try {
            const response = await fetch("/user/updatepassword", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestData),
            });
            const data = await response.json();
            if (response.ok) {
              alert(data.message);
              document.getElementById("resetPasswordForm").reset();
            } else {
              alert(data.message);
            }
          } catch (error) {
            alert("An error occurred. Please try again later.");
          }
        });