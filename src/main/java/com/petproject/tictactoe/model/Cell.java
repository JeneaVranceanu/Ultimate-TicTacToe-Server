package com.petproject.tictactoe.model;

import javax.json.Json;
import javax.json.JsonObject;

public class Cell {

    private int x;
    private int y;
    private Shape shape;

    public Cell(int x, int y, Shape shape) {
        this.x = x;
        this.y = y;
        this.shape = shape;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public Shape getShape() {
        return shape;
    }

    public void setShape(Shape shape) {
        this.shape = shape;
    }

    @Override
    public String toString() {
        return Json.createObjectBuilder()
            .add("x", x)
            .add("y", y)
            .add("shape", shape.getShapeName())
            .build().toString();
    }

    public JsonObject toJson() {
        return Json.createObjectBuilder()
            .add("x", x)
            .add("y", y)
            .add("shape", shape.getShapeName())
            .build();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Cell cell = (Cell) o;
        return x == cell.x && y == cell.y && shape.equals(cell.getShape());
    }

}
