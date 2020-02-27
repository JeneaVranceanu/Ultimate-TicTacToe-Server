package utils;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.enterprise.inject.spi.InjectionPoint;

import org.slf4j.Logger;

@ApplicationScoped
public class LoggerFactory {

    @Produces
    public Logger initiateLogger(InjectionPoint point) {
        if (point.getMember() != null) {
            return org.slf4j.LoggerFactory.getLogger(point.getMember().getDeclaringClass().getName());
        }
        return org.slf4j.LoggerFactory.getLogger(LoggerFactory.class);
    }

}