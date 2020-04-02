package com.petproject.tictactoe.model;

public enum Shape {

    X("X"), O("O"), EMPTY("EMPTY");

    private String shape;

    Shape(String shape) {
        this.shape = shape;
    }

    public String getShapeName() {
        return shape;
    }
}