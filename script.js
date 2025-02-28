document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");

  // Auto-resize the textarea
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
  });

  // Handle Enter key press
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevents new line in textarea
      chatForm.dispatchEvent(new Event("submit")); // Trigger form submission
    }
  });

  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = "";
    userInput.style.height = "auto";
    sendButton.disabled = true;

    const typingIndicator = showTypingIndicator();
    try {
      const response = await generateResponse(message);
      typingIndicator.remove();
      addMessage(response, false);
    } catch (error) {
      typingIndicator.remove();
      addErrorMessage(error.message);
    } finally {
      sendButton.disabled = false;
    }
  });

  // Generate response
  async function generateResponse(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDlA-PxqgIdW2lnImBjs8HWsrTKeseX-OI`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate the response");
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Add user message to chat
  function addMessage(text, isUser) {
    const message = document.createElement("div");
    message.className = `message ${isUser ? "user-message" : ""}`;
    message.innerHTML = `
      <div class="avatar ${isUser ? "user-avatar" : ""}">
        ${isUser ? "You" : "AI"}
      </div>
      <div class='message-content'>${text}</div>
    `;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Show typing indicator
  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message";
    indicator.innerHTML = `
      <div class="avatar">AI</div>
      <div class="typing-indicator">
        <div class='dot'></div>
        <div class='dot'></div>
        <div class='dot'></div>
      </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  // Show error message
  function addErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "message";
    message.innerHTML = `
      <div class="avatar">AI</div>
      <div class="message-content" style="color:red">
        Error: ${text}
      </div>
    `;
    chatMessages.appendChild(message);
  }
});
