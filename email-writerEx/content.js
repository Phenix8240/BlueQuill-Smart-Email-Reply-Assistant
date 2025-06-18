// Content script for Gmail AI reply integration
console.log("Content script loaded");

const API_URL = "http://localhost:8080/api/email/generate"; // Replace with your backend URL

function findComponentToolbar() {
    const selectors = ['.aDh', '.btC', '[role="dialog"][aria-label="Compose"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            console.log(`Toolbar found with selector: ${selector}`);
            return toolbar;
        }
    }
    return null;
}

function getEmailContent() {
    const selectors = ['.a3s.aiL', '.h7', '[role="presentation"]', '.gmail_quote'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            let text = content.innerText.trim();

            // Remove forwarded headers, replies etc.
            text = text.replace(/(From:|On .* wrote:|Forwarded message:)[\s\S]*$/gi, '').trim();

            console.log("Cleaned Email Content:", text);
            return text;
        }
    }
    return '';
}

function getSenderName() {
    const fromField = document.querySelector('.gD');
    if (fromField) {
        const name = fromField.textContent.trim();
        console.log("Sender (from .gD):", name);
        return name;
    }

    const profile = document.querySelector('a[aria-label*="Google Account"]');
    if (profile) {
        const match = profile.getAttribute('aria-label').match(/Google Account: (.*?) \(/);
        if (match && match[1]) {
            console.log("Sender (from profile):", match[1].trim());
            return match[1].trim();
        }
    }

    return "Unknown Sender";
}

function getRecipientName() {
    const toField = document.querySelector('textarea[name="to"], .vO');
    if (toField) {
        const value = toField.value || toField.innerText;
        const match = value.match(/(.*?)\s*<([^>]+)>/);
        if (match) {
            const name = match[1].trim();
            const email = match[2].trim();
            console.log("Recipient Name (COMPOSE):", name, "| Email:", email);
            return name || email;
        } else {
            console.log("Recipient (COMPOSE, no name):", value.trim());
            return value.trim();
        }
    }

    const recipientElement = document.querySelector('.g2');
    if (recipientElement) {
        const nameAttr = recipientElement.getAttribute('name');
        const emailAttr = recipientElement.getAttribute('email');
        const name = nameAttr?.trim();
        const email = emailAttr?.trim();

        console.log("Recipient Name (REPLY):", name, "| Email:", email);
        return name || email || recipientElement.innerText.trim();
    }

    return "Unknown Recipient";
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-J J-J5-Ji aoO v7 T-I-atl L3 ai-reply-button';
    button.style = `
        margin-right: 8px;
        cursor: pointer;
        background-color: #1a73e8;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.3s ease;
    `;
    button.innerHTML = `
        <span class="ai-icon" style="font-size: 16px;">🪶</span>
        <span>Generate AI Reply</span>
    `;
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI reply');

    // Hover effect
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = '#1669c1';
    });
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = '#1a73e8';
    });

    return button;
}


function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComponentToolbar();
    if (!toolbar) {
        console.log("Toolbar not found, retrying in 500ms.");
        setTimeout(injectButton, 500);
        return;
    }

    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = `Generating...`;
            button.disabled = true;

            const emailContent = getEmailContent();
            const senderName = getRecipientName();
            const recipientName = getSenderName();;

            const payload = {
                emailContent,
                tone: "professional",
                senderName,
                recipientName,
                includeSignature: true,
                formalGreeting: true,
                desiredLength: 150
            };

            console.log("Payload being sent:", payload);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const generateReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generateReply);
            } else {
                console.error("Compose box not found.");
            }
        } catch (error) {
            console.error("AI reply generation failed:", error);
        } finally {
            button.innerHTML = `\uD83E\uDEB6 Generate AI Reply`;
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const added = Array.from(mutation.addedNodes);
        const hasCompose = added.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .bDh, [role="dialog"][aria-label="Compose"]') ||
                node.querySelector?.('.aDh, .bDh, [role="dialog"][aria-label="Compose"]'))
        );
        if (hasCompose) {
            console.log("Compose elements detected, injecting script.");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });
