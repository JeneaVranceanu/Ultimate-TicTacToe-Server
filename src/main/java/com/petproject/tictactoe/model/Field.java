package com.petproject.tictactoe.model;

import java.util.ArrayList;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;

public class Field {

    private List<Cell> field = new ArrayList<>(9);
    private Cell lastModifiedCell;

    public boolean canFillCell(Cell cell) {
        return !this.field.contains(cell);
    }

    public boolean fillCell(Cell cell) {
        if (canFillCell(cell)) {
            lastModifiedCell = cell;
            this.field.add(cell);
            return true;
        } else {
            return false;
        }
    }

    public Cell lastModifiedCell() {
        return lastModifiedCell;
    }

    public List<Cell> getField() {
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
        field.forEach(cell -> json.add(cell.toJson()));
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