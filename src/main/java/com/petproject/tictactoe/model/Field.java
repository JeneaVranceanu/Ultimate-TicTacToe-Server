package com.petproject.tictactoe.model;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;

public class Field {

    private List<Mark> field;

    Field(Size size) {
        populateField(size);
    }

    private void populateField(Size size) {
        this.field = Stream.generate(() -> Mark.EMPTY)
            .limit(size.getSize())
            .collect(Collectors.toList());
    }

    public boolean canSetMark(int cell) {
        return this.field.get(cell).equals(Mark.EMPTY);
    }

    public boolean setMark(Mark mark, int cell) {
        if (canSetMark(cell)) {
            this.field.set(cell, mark);
            return true;
        } else {
            return false;
        }
    }

    public List<Mark> getField() {
        return field;
    }

    public int getSize() {
        return field.size();
    }

    @Override
    public String toString() {
        return toJsonArray().toString();
    }

    public JsonArray toJsonArray() {
        JsonArrayBuilder json = Json.createArrayBuilder();
        field.forEach(cell -> json.add(cell.getMarkName()));;
        return json.build();
    }

    public enum Size {

        DEFAULT(9), MEDIUM(16);

        private int size;

        Size(int size) {
            this.size = size;
        }

        public int getSize() {
            return size;
        }
    }

}