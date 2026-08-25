package com.taskflow.taskservice.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * user-service and notification-service both require a valid Authorization
 * header (they run their own JWT filter). Feign clients don't forward
 * anything by default, so without this, every internal call task-service
 * makes to them - e.g. validating an assignedUserId when creating a task -
 * arrives with no auth and gets rejected. This copies the original caller's
 * Authorization header (and the identity headers the gateway attaches) onto
 * every outbound Feign request.
 */
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor authForwardingInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes == null) {
                return;
            }

            var request = attributes.getRequest();
            forwardHeader(request, requestTemplate, "Authorization");
            forwardHeader(request, requestTemplate, "X-User-Id");
            forwardHeader(request, requestTemplate, "X-User-Email");
            forwardHeader(request, requestTemplate, "X-User-Role");
        };
    }

    private void forwardHeader(jakarta.servlet.http.HttpServletRequest request,
                                feign.RequestTemplate requestTemplate,
                                String name) {
        String value = request.getHeader(name);
        if (value != null) {
            requestTemplate.header(name, value);
        }
    }
}
