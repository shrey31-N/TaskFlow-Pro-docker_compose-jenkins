package com.taskflow.apigateway.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * Lets the gateway inject extra headers (X-User-Id, X-User-Email,
 * X-User-Role) onto an already-received request before it's routed
 * downstream. Spring Cloud Gateway's MVC/webmvc routing builds the
 * proxied outbound request from this HttpServletRequest's headers, so
 * anything added here is what downstream services (task-service,
 * project-service, ...) see as the caller's identity - services never
 * validate the JWT themselves, they trust these headers because they can
 * only have been set by this gateway's own JwtAuthenticationFilter.
 */
public class UserHeaderRequestWrapper extends HttpServletRequestWrapper {

    private final Map<String, String> extraHeaders = new HashMap<>();

    public UserHeaderRequestWrapper(HttpServletRequest request) {
        super(request);
    }

    public void addHeader(String name, String value) {
        if (value != null) {
            extraHeaders.put(name, value);
        }
    }

    @Override
    public String getHeader(String name) {
        String value = extraHeaders.get(name);
        return value != null ? value : super.getHeader(name);
    }

    @Override
    public Enumeration<String> getHeaders(String name) {
        String value = extraHeaders.get(name);
        return value != null ? Collections.enumeration(Collections.singletonList(value)) : super.getHeaders(name);
    }

    @Override
    public Enumeration<String> getHeaderNames() {
        if (extraHeaders.isEmpty()) {
            return super.getHeaderNames();
        }

        java.util.Set<String> names = new java.util.LinkedHashSet<>(extraHeaders.keySet());
        Collections.list(super.getHeaderNames()).forEach(names::add);
        return Collections.enumeration(names);
    }
}
