package com.petproject.tictactoe.model;

import java.util.ArrayList;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;

public class Field {

    private List<Cell> field = new ArrayList<>(9);
    private Cell lastModifiedCell;
    private Format format = Format.DEFAULT;

    public boolean canFillCell(Cell cell) {
        return !this.field.stream().anyMatch(c -> cell.getX() == c.getX() && cell.getY() == c.getY())
                && this.field.size() < this.format.getFormat();
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

    public Format getFormat() {
        return format;
    }

    public boolean isFull() {
        return field.size() == format.getFormat();
    }

    @Override
    public String toString() {
        JsonArrayBuilder json = Json.createArrayBuilder();
        field.forEach(cell -> json.add(cell.toJson()));
        return json.build().toString();
    }

    public JsonArray toJson() {
        JsonArrayBuilder json = Json.createArrayBuilder();
        field.forEach(cell -> json.add(cell.toJson()));
        return json.build();
    }

    public enum Format {

        DEFAULT(9), MEDIUM(16);

        private int format;

        Format(int format) {
            this.format = format;
        }

        public int getFormat() {
            return format;
        }
    }

}