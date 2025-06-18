# 💠 BlueQuill – Email Reply Extension

**BlueQuill** is a Chrome extension that enhances your Gmail experience by adding an **AI-powered reply generator**. Whether you're composing a new email or replying to one, BlueQuill assists you with context-aware, professional responses with a single click.

---

## ✨ Features

- 🧠 **AI-Powered Responses**  
  Generates context-aware, professional email replies using your selected tone and signature preferences.

- 📬 **Smart Sender/Recipient Detection**  
  Automatically identifies sender and recipient names for personalized replies.

- 🔄 **Works with Compose and Reply Modes**  
  Seamlessly detects whether you're composing a new mail or replying to an existing one.

- 🎨 **Custom UI Button**  
  A sleek blue button labeled "🪶 Generate AI Reply" is injected into Gmail's toolbar for quick access.

---

## 🛠 How It Works

1. The extension observes changes in Gmail’s DOM.
2. When a compose or reply box appears, it injects the **BlueQuill** button.
3. On button click, it:
   - Extracts the current email content.
   - Detects the sender and recipient.
   - Sends data to a backend API (`/api/email/generate`) for AI reply generation.
   - Inserts the reply into the email textbox.

---

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/bluequill-extension.git
