package com.email.email_writer.controller;

import com.email.email_writer.entity.EmailRequest;
import com.email.email_writer.exception.EmailGenerationException;
import com.email.email_writer.service.EmailGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;


@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Tag(name = "Email Generator", description = "API for generating professional email replies")
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    public EmailGeneratorController(EmailGeneratorService emailGeneratorService) {
        this.emailGeneratorService = emailGeneratorService;
    }

    @PostMapping("/generate")
    @Operation(summary = "Generate email reply",
            description = "Generates a professional email reply based on the input content and parameters",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Email generated successfully",
                            content = @Content(schema = @Schema(implementation = String.class))),
                    @ApiResponse(responseCode = "400", description = "Invalid input parameters"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            })
    public ResponseEntity<?> generateEmail(@Valid @RequestBody EmailRequest emailRequest) {
        try {
            String response = emailGeneratorService.generateEmailReply(emailRequest);
            return ResponseEntity.ok(response);
        } catch (EmailGenerationException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email generation failed",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Internal server error",
                    "message", "An unexpected error occurred"
            ));
        }
    }

    @GetMapping("/tones")
    @Operation(summary = "Get available tones",
            description = "Returns a list of available tones that can be used for email generation")
    public ResponseEntity<Map<String, String[]>> getAvailableTones() {
        return ResponseEntity.ok(Map.of(
                "tones", new String[]{"professional", "friendly", "apologetic", "enthusiastic", "neutral"}
        ));
    }
}