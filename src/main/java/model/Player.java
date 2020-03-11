package model;

import javax.websocket.Session;

public class Player {

    private Session session;
    private char mark;
    private String room;
    private String name;

    public Player(String room, String name, char mark, Session session) {
        this.room = room;
        this.name = name;
        this.mark = mark;
        this.session = session;
    }

    public String getName() {
        return name;
    }

    public String getRoom() {
        return room;
    }

    public char getMark() {
        return mark;
    }

    public Session getSession() {
        return session;
    }

    @Override
    public String toString() {
        return String.format("Name: %s, IP: %s, Mark: %c", name, room, mark);
    }
    
}