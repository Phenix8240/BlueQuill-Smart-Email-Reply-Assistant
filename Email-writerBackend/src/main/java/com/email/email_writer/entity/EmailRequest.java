package com.email.email_writer.entity;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
public class EmailRequest {
    @NotBlank(message = "Email content cannot be blank")
    @Size(min = 2, message = "Email content must be at least 10 characters")
    private String emailContent;

    private String tone;

    @Size(max = 50, message = "Sender name must be less than 50 characters")
    private String senderName;

    @Size(max = 50, message = "Recipient name must be less than 50 characters")
    private String recipientName;

    private boolean includeSignature = true;
    private boolean formalGreeting = true;
    private Integer desiredLength; // in words

    // Custom validation for tone
    public boolean isValidTone() {
        if (tone == null || tone.isEmpty()) return true;
        String[] validTones = {"professional", "friendly", "apologetic", "enthusiastic", "neutral"};
        for (String validTone : validTones) {
            if (validTone.equalsIgnoreCase(tone)) {
                return true;
            }
        }
        return false;
    }

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public boolean isIncludeSignature() {
        return includeSignature;
    }

    public void setIncludeSignature(boolean includeSignature) {
        this.includeSignature = includeSignature;
    }

    public boolean isFormalGreeting() {
        return formalGreeting;
    }

    public void setFormalGreeting(boolean formalGreeting) {
        this.formalGreeting = formalGreeting;
    }

    public Integer getDesiredLength() {
        return desiredLength;
    }

    public void setDesiredLength(Integer desiredLength) {
        this.desiredLength = desiredLength;
    }
}