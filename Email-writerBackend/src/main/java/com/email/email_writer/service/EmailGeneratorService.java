package com.email.email_writer.service;

import com.email.email_writer.entity.EmailRequest;
import com.email.email_writer.exception.EmailGenerationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeoutException;

@Service
public class EmailGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(EmailGeneratorService.class);
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final long RETRY_DELAY_MS = 1000;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${email.default.signature}")
    private String defaultSignature;

    public EmailGeneratorService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String generateEmailReply(EmailRequest emailRequest) throws EmailGenerationException {
        if (!emailRequest.isValidTone()) {
            throw new EmailGenerationException("Invalid tone specified. Allowed values: professional, friendly, apologetic, enthusiastic, neutral");
        }

        String prompt = buildPrompt(emailRequest);
        Map<String, Object> requestBody = createRequestBody(prompt);

        return executeWithRetry(requestBody, 0, emailRequest);
    }

    private String executeWithRetry(Map<String, Object> requestBody, int attempt, EmailRequest emailRequest) throws EmailGenerationException {
        try {
            String response = webClient.post()
                    .uri(geminiApiUrl + "?key=" + geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError(),
                            resp -> resp.bodyToMono(String.class)
                                    .flatMap(body -> Mono.error(new EmailGenerationException("Client error: " + body)))
                    )
                    .onStatus(
                            status -> status.is5xxServerError(),
                            resp -> resp.bodyToMono(String.class)
                                    .flatMap(body -> Mono.error(new EmailGenerationException("Server error: " + body)))
                    )
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            return processResponse(response, emailRequest);
        } catch (WebClientResponseException e) {
            logger.error("API request failed: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (attempt < MAX_RETRY_ATTEMPTS) {
                logger.info("Retrying attempt {}/{}", attempt + 1, MAX_RETRY_ATTEMPTS);
                try {
                    Thread.sleep(RETRY_DELAY_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new EmailGenerationException("Thread interrupted during retry", ie);
                }
                return executeWithRetry(requestBody, attempt + 1, emailRequest);
            }
            throw new EmailGenerationException("Failed after " + MAX_RETRY_ATTEMPTS + " attempts: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error", e);
            throw new EmailGenerationException("Unexpected error: " + e.getMessage(), e);
        }
    }
    private Map<String, Object> createRequestBody(String prompt) {
        return Map.of(
                "contents", new Object[]{
                        Map.of(
                                "parts", new Object[]{
                                        Map.of("text", prompt)
                                }
                        )
                },
                "generationConfig", Map.of(
                        "temperature", 0.7,
                        "topP", 0.9,
                        "maxOutputTokens", 2000
                )
        );
    }

    private String processResponse(String response, EmailRequest emailRequest) throws EmailGenerationException {
        try {
            JsonNode rootNode = objectMapper.readTree(response);

            if (!rootNode.has("candidates") || rootNode.get("candidates").isEmpty()) {
                throw new EmailGenerationException("No candidates found in the response");
            }

            String generatedContent = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            return postProcessEmail(generatedContent, emailRequest);
        } catch (Exception e) {
            throw new EmailGenerationException("Error processing API response", e);
        }
    }

    private String postProcessEmail(String emailContent, EmailRequest emailRequest) {
        // Add signature if requested
        if (emailRequest.isIncludeSignature() && defaultSignature != null) {
            emailContent += "\n\n" + defaultSignature;
        }

        // Remove any placeholders or unwanted patterns
        emailContent = emailContent.replaceAll("\\*\\*\\*.*?\\*\\*\\*", ""); // Remove markdown bold
        emailContent = emailContent.replaceAll("\\[.*?\\]", ""); // Remove square brackets

        return emailContent.trim();
    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate a professional email reply with the following requirements:\n");

        // Basic instructions
        prompt.append("- Do not generate a subject line\n");
        prompt.append("- Format the email properly with paragraphs\n");

        // Tone specification
        if (emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()) {
            prompt.append("- Use a ").append(emailRequest.getTone()).append(" tone\n");
        }

        // Length specification
        if (emailRequest.getDesiredLength() != null) {
            prompt.append("- Keep the email around ").append(emailRequest.getDesiredLength()).append(" words\n");
        }

        // Names
        if (emailRequest.getRecipientName() != null && !emailRequest.getRecipientName().isEmpty()) {
            prompt.append("- Address the recipient as ").append(emailRequest.getRecipientName()).append("\n");
        }

        if (emailRequest.getSenderName() != null && !emailRequest.getSenderName().isEmpty()) {
            prompt.append("- Sign the email as ").append(emailRequest.getSenderName()).append("\n");
        }

        // Greeting style
        if (emailRequest.isFormalGreeting()) {
            prompt.append("- Use a formal greeting (e.g., 'Dear [Name]')\n");
        } else {
            prompt.append("- Use a casual greeting (e.g., 'Hi [Name]')\n");
        }

        prompt.append("\nOriginal email content to reply to:\n").append(emailRequest.getEmailContent());

        return prompt.toString();
    }
}