package com.petproject.tictactoe.utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.config.ConfigProvider;

@ApplicationScoped
public class RandomNameGenerator {
    
    private static Random rand;
    private static List<String> adjectives = new ArrayList<>();
    private static List<String> nouns = new ArrayList<>();

    static {
        rand = new Random();
        adjectives.addAll(Arrays.asList(ConfigProvider.getConfig().getValue("randomAdjectives", String.class).split(",")));
        nouns.addAll(Arrays.asList(ConfigProvider.getConfig().getValue("randomNouns", String.class).split(",")));
        adjectives.removeIf(s -> s.isBlank());
        nouns.removeIf(s -> s.isBlank());
    }

    private RandomNameGenerator() {
    }

    public static String get() {
        StringBuilder sb = new StringBuilder(adjectives.get(rand.nextInt(adjectives.size())));
        sb.insert(1,Character.toUpperCase(sb.charAt(0)));
        sb.deleteCharAt(0);
        sb.append(" ").append(nouns.get(rand.nextInt(nouns.size())));
        return sb.toString();
    }

   

}