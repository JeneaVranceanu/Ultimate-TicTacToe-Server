package utils;

public class Params {

    private String ip;
    private String name;

    Params(String ip, String name) { 
        this.ip = ip;
        this.name = name;
    }

    public String getIp() {
        return ip;
    }

    public String getName() {
        return name;
    }

}
