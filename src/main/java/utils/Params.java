package utils;

public class Params {

    private String room;
    private String name;

    Params(String room, String name) { 
        this.room = room;
        this.name = name;
    }

    public String getRoom() {
        return room;
    }

    public String getName() {
        return name;
    }

}
