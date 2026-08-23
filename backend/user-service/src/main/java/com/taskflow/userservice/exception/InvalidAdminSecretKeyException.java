package com.taskflow.userservice.exception;

public class InvalidAdminSecretKeyException extends RuntimeException {

    public InvalidAdminSecretKeyException(String message) {
        super(message);
    }
}
