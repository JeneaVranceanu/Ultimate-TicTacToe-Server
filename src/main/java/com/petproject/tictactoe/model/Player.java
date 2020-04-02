package com.petproject.tictactoe.model;

import java.util.UUID;

import javax.json.Json;
import javax.websocket.Session;

public class Player {

    private Session session;
    private Shape shape;
    private String name;
    private String id;

    public Player(String name, Shape shape, Session session) {
        this.name = name;
        this.shape = shape;
        this.session = session;
        this.id = UUID.randomUUID().toString();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Shape getShape() {
        return shape;
    }

    public void setShape(Shape shape) {
        this.shape = shape;
    }

    public Session getSession() {
        return session;
    }

    @Override
    public String toString() {
        return Json.createObjectBuilder()
            .add("sessionId", session.getId())
            .add("shape", shape.getShapeName())
            .add("name", name)
            .add("id", id)
            .build().toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Player player = (Player) o;
        return session.getId().equals(player.session.getId()) &&
                shape.equals(player.getShape()) &&
                name.equals(player.name) &&
                id.equals(player.id);
    }
    
}
