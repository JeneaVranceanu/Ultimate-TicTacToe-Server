package com.petproject.tictactoe.model;

import java.util.UUID;

import javax.websocket.Session;

public class Player {

    private Session session;
    private Mark mark;
    private String name;
    private String id;

    public Player(String name, Mark mark, Session session) {
        this.name = name;
        this.mark = mark;
        this.session = session;
        this.id = UUID.randomUUID().toString();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Mark getMark() {
        return mark;
    }

    public void setMark(Mark mark) {
        this.mark = mark;
    }

    public Session getSession() {
        return session;
    }

    @Override
    public String toString() {
        return String.format("Name: %s, ID: %s, Mark: %s", name, id, mark.getMarkName());
    }
    
}