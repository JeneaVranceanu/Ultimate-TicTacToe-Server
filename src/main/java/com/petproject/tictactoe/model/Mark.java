package com.petproject.tictactoe.model;

public enum Mark {

    X("X"), O("O"), EMPTY("EMPTY");

    private String mark;

    Mark(String mark) {
        this.mark = mark;
    }

    public String getMarkName() {
        return mark;
    }
}