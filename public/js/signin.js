const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
forgotPasswordBtn.addEventListener("click", function handleForgotPassword() {
  let loginForm = document.getElementById("loginForm");
  loginForm.style.display = "none";
  let forgorPasswordForm = document.getElementById("forgorPasswordForm");
  forgorPasswordForm.style.display = "block";
  let forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
  forgotPasswordBtn.style.display = "none";
  let signupLink = document.getElementById("signup");
  signupLink.style.display = "none";
  let signinLink = document.getElementById("signinLink");
  signinLink.style.display = "block";
});

document
  .getElementById("forgorPasswordForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const forgotPasswordEmail = document.getElementById(
      "forgotPasswordEmail"
    ).value;
    try {
      const response = await axios.post(
        "http://localhost:8080/user/forgotpassword",
        {
          forgotPasswordEmail,
        }
      );
      alert(response.data.message);
    } catch (error) {
      console.error("Error during forgot password request: ", error);
    }
  });
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch(
      "http://expensetrackernode-env.eba-gha72emd.ap-south-1.elasticbeanstalk.com/user/signin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            alert(data.message);
            throw new Error(data.message);
          });
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userDetails", JSON.stringify(data.data.user));
        alert("Login successful!");
        window.location.href = "/expenses";
      })
      .catch((error) => {
        console.error("Error during login: ", error);
      });
  });
