import javax.websocket.Session;

public class Player {

    Session session;
    char mark;
    String ip;
    String name;

    public Player(String ip, String name, char mark, Session session) {
        this.ip = ip;
        this.name = name;
        this.mark = mark;
        this.session = session;
    }

    public String getName() {
        return name;
    }

    public String getIp() {
        return ip;
    }

    public char getMark() {
        return mark;
    }

    public Session getSession() {
        return session;
    }

    @Override
    public String toString() {
        return String.format("Name: %s, IP: %s, Mark: %c", name, ip, mark);
    }
    
}